package com.lizhao.yizhao.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lizhao.yizhao.config.XfTtsProperties;
import com.lizhao.yizhao.exception.TtsException;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Base64;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
public class XfTtsClient {
  private static final int MAX_TEXT_BYTES = 8000;

  private final XfTtsProperties properties;
  private final ObjectMapper objectMapper;
  private final OkHttpClient httpClient;

  public XfTtsClient(XfTtsProperties properties, ObjectMapper objectMapper) {
    this.properties = properties;
    this.objectMapper = objectMapper;
    this.httpClient = new OkHttpClient.Builder()
      .connectTimeout(Duration.ofSeconds(10))
      .readTimeout(Duration.ofMillis(Math.max(properties.getTimeoutMs(), 30000)))
      .writeTimeout(Duration.ofSeconds(10))
      .pingInterval(Duration.ofSeconds(20))
      .build();
  }

  public byte[] synthesize(String text, String vcn, int speed, int volume, int pitch) {
    if (!StringUtils.hasText(properties.getAppId())
      || !StringUtils.hasText(properties.getApiKey())
      || !StringUtils.hasText(properties.getApiSecret())) {
      throw new TtsException("请先在 application-local.properties 中配置讯飞 APPID、APIKey 和 APISecret");
    }

    String content = text == null ? "" : text.trim();
    if (!StringUtils.hasText(content)) {
      throw new IllegalArgumentException("文本内容不能为空");
    }

    ByteArrayOutputStream audio = new ByteArrayOutputStream();
    for (String chunk : splitText(content, MAX_TEXT_BYTES)) {
      byte[] part = requestAudio(chunk, vcn, speed, volume, pitch);
      if (part != null && part.length > 0) {
        audio.writeBytes(part);
      }
    }
    if (audio.size() == 0) {
      throw new TtsException("未收到音频数据");
    }
    return audio.toByteArray();
  }

  private byte[] requestAudio(String text, String vcn, int speed, int volume, int pitch) {
    CompletableFuture<byte[]> future = new CompletableFuture<>();
    WebSocket webSocket;
    try {
      Request request = new Request.Builder().url(generateWebSocketUrl()).build();
      webSocket = httpClient.newWebSocket(request, new TtsListener(
        objectMapper.writeValueAsString(createRequestPayload(text, vcn, speed, volume, pitch)),
        objectMapper,
        future
      ));
    } catch (TtsException e) {
      throw e;
    } catch (Exception e) {
      throw new TtsException("创建语音合成连接失败", e);
    }

    try {
      return future.get(Math.max(properties.getTimeoutMs(), 1000), TimeUnit.MILLISECONDS);
    } catch (TimeoutException e) {
      webSocket.cancel();
      throw new TtsException("请求超时");
    } catch (Exception e) {
      webSocket.cancel();
      Throwable cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof TtsException ttsException) {
        throw ttsException;
      }
      throw new TtsException(cause.getMessage() != null ? cause.getMessage() : "语音合成失败", cause);
    }
  }

  private Map<String, Object> createRequestPayload(String text, String vcn, int speed, int volume, int pitch) {
    Map<String, Object> common = new LinkedHashMap<>();
    common.put("app_id", properties.getAppId());

    Map<String, Object> business = new LinkedHashMap<>();
    business.put("aue", properties.getAue());
    business.put("sfl", properties.getSfl());
    business.put("auf", properties.getAuf());
    business.put("vcn", vcn);
    business.put("speed", speed);
    business.put("volume", volume);
    business.put("pitch", pitch);
    business.put("bgs", properties.getBgs());
    business.put("tte", properties.getTte());
    business.put("reg", properties.getReg());
    business.put("rdn", properties.getRdn());

    Map<String, Object> data = new LinkedHashMap<>();
    data.put("status", 2);
    data.put("text", Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8)));

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("common", common);
    payload.put("business", business);
    payload.put("data", data);
    return payload;
  }

  private String generateWebSocketUrl() {
    try {
      String host = properties.getHost();
      String date = gmtDate();
      String signatureOrigin = "host: " + host + "\ndate: " + date + "\nGET /v2/tts HTTP/1.1";
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(properties.getApiSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      String signature = Base64.getEncoder().encodeToString(mac.doFinal(signatureOrigin.getBytes(StandardCharsets.UTF_8)));
      String authorizationOrigin = "api_key=\"" + properties.getApiKey()
        + "\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\""
        + signature + "\"";
      String authorization = Base64.getEncoder().encodeToString(authorizationOrigin.getBytes(StandardCharsets.UTF_8));
      return properties.getBaseUrl()
        + "?host=" + urlEncode(host)
        + "&date=" + urlEncode(date)
        + "&authorization=" + urlEncode(authorization);
    } catch (Exception e) {
      throw new TtsException("生成讯飞鉴权地址失败", e);
    }
  }

  private String gmtDate() {
    SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
    format.setTimeZone(TimeZone.getTimeZone("GMT"));
    return format.format(new Date());
  }

  private String urlEncode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
  }

  static java.util.List<String> splitText(String text, int maxBytes) {
    byte[] all = text.getBytes(StandardCharsets.UTF_8);
    if (all.length <= maxBytes) {
      return java.util.List.of(text);
    }

    java.util.List<String> chunks = new java.util.ArrayList<>();
    StringBuilder current = new StringBuilder();
    int currentBytes = 0;
    int index = 0;
    while (index < text.length()) {
      int codePoint = text.codePointAt(index);
      int charCount = Character.charCount(codePoint);
      String piece = text.substring(index, index + charCount);
      int pieceBytes = piece.getBytes(StandardCharsets.UTF_8).length;
      if (currentBytes > 0 && currentBytes + pieceBytes > maxBytes) {
        chunks.add(current.toString());
        current.setLength(0);
        currentBytes = 0;
        continue;
      }
      if (pieceBytes > maxBytes) {
        throw new TtsException("文本过长，无法拆分");
      }
      current.append(piece);
      currentBytes += pieceBytes;
      index += charCount;
    }
    if (current.length() > 0) {
      chunks.add(current.toString());
    }
    return chunks;
  }

  private static class TtsListener extends WebSocketListener {
    private final String payload;
    private final ObjectMapper objectMapper;
    private final CompletableFuture<byte[]> future;
    private final ByteArrayOutputStream audio = new ByteArrayOutputStream();

    TtsListener(String payload, ObjectMapper objectMapper, CompletableFuture<byte[]> future) {
      this.payload = payload;
      this.objectMapper = objectMapper;
      this.future = future;
    }

    @Override
    public void onOpen(WebSocket webSocket, Response response) {
      webSocket.send(payload);
    }

    @Override
    public void onMessage(WebSocket webSocket, String text) {
      try {
        JsonNode response = objectMapper.readTree(text);
        int code = response.path("code").asInt(-1);
        if (code != 0) {
          completeExceptionally(new TtsException("语音合成失败: " + response.path("message").asText(String.valueOf(code))));
          webSocket.close(1000, "fail");
          return;
        }

        JsonNode data = response.path("data");
        String audioBase64 = data.path("audio").asText("");
        if (StringUtils.hasText(audioBase64)) {
          audio.write(Base64.getDecoder().decode(audioBase64));
        }
        if (data.path("status").asInt(-1) == 2) {
          future.complete(audio.toByteArray());
          webSocket.close(1000, "ok");
        }
      } catch (Exception e) {
        completeExceptionally(new TtsException("语音合成响应解析失败", e));
        webSocket.cancel();
      }
    }

    @Override
    public void onClosing(WebSocket webSocket, int code, String reason) {
      webSocket.close(code, reason);
    }

    @Override
    public void onClosed(WebSocket webSocket, int code, String reason) {
      if (!future.isDone()) {
        completeExceptionally(new TtsException("WebSocket连接意外关闭"));
      }
    }

    @Override
    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
      completeExceptionally(new TtsException(
        t.getMessage() != null ? ("WebSocket错误: " + t.getMessage()) : "WebSocket错误",
        t
      ));
    }

    private void completeExceptionally(Throwable throwable) {
      future.completeExceptionally(throwable);
    }
  }
}
