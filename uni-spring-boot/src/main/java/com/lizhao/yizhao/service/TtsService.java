package com.lizhao.yizhao.service;

import com.lizhao.yizhao.config.XfTtsProperties;
import com.lizhao.yizhao.dto.request.TtsSynthesizeRequest;
import com.lizhao.yizhao.dto.response.TtsSynthesizeResponse;
import com.lizhao.yizhao.exception.CosException;
import com.lizhao.yizhao.exception.TtsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.annotation.PreDestroy;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class TtsService {
  private static final Logger logger = LoggerFactory.getLogger(TtsService.class);

  private final XfTtsProperties xfTtsProperties;
  private final XfTtsClient xfTtsClient;
  private final CosStorageService cosStorageService;
  private final ConcurrentHashMap<String, CompletableFuture<TtsSynthesizeResponse>> inflight = new ConcurrentHashMap<>();
  private final ExecutorService executor = Executors.newFixedThreadPool(4, runnable -> {
    Thread thread = new Thread(runnable, "tts-synthesize");
    thread.setDaemon(true);
    return thread;
  });

  public TtsService(
    XfTtsProperties xfTtsProperties,
    XfTtsClient xfTtsClient,
    CosStorageService cosStorageService
  ) {
    this.xfTtsProperties = xfTtsProperties;
    this.xfTtsClient = xfTtsClient;
    this.cosStorageService = cosStorageService;
  }

  public TtsSynthesizeResponse synthesize(TtsSynthesizeRequest request) {
    NormalizedParams params = normalize(request);
    String objectKey = cosStorageService.buildObjectKey("tts", params.fileName);
    CompletableFuture<TtsSynthesizeResponse> future = inflight.computeIfAbsent(
      objectKey,
      key -> CompletableFuture.supplyAsync(() -> doSynthesize(params, key), executor)
    );
    try {
      return future.join();
    } catch (java.util.concurrent.CompletionException e) {
      Throwable cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException runtimeException) {
        throw runtimeException;
      }
      throw new TtsException(cause.getMessage() != null ? cause.getMessage() : "语音合成失败", cause);
    } finally {
      inflight.remove(objectKey, future);
    }
  }

  private TtsSynthesizeResponse doSynthesize(NormalizedParams params, String objectKey) {
    try {
      if (cosStorageService.exists(objectKey)) {
        String url = cosStorageService.publicUrl(objectKey);
        logger.info("TTS cache hit, key={}", objectKey);
        return new TtsSynthesizeResponse(url, true);
      }

      logger.info("TTS cache miss, synthesizing key={}", objectKey);
      byte[] audio = xfTtsClient.synthesize(params.text, params.vcn, params.speed, params.volume, params.pitch);
      cosStorageService.upload(objectKey, audio, "audio/mpeg", "public, max-age=31536000, immutable");
      return new TtsSynthesizeResponse(cosStorageService.publicUrl(objectKey), false);
    } catch (CosException e) {
      throw new TtsException(e.getMessage(), e);
    }
  }

  private NormalizedParams normalize(TtsSynthesizeRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("请求参数不能为空");
    }
    String text = request.getText() == null ? "" : request.getText().trim();
    if (!StringUtils.hasText(text)) {
      throw new IllegalArgumentException("文本内容不能为空");
    }

    String vcn = StringUtils.hasText(request.getVcn()) ? request.getVcn().trim() : xfTtsProperties.getVcn();
    int speed = clamp(request.getSpeed(), xfTtsProperties.getSpeed());
    int volume = clamp(request.getVolume(), xfTtsProperties.getVolume());
    int pitch = clamp(request.getPitch(), xfTtsProperties.getPitch());
    String fileName = sha256Hex(String.join("|",
      "v1",
      text,
      vcn,
      String.valueOf(speed),
      String.valueOf(volume),
      String.valueOf(pitch),
      xfTtsProperties.getAue(),
      xfTtsProperties.getAuf()
    )) + ".mp3";
    return new NormalizedParams(text, vcn, speed, volume, pitch, fileName);
  }

  private int clamp(Integer value, int fallback) {
    int number = value == null ? fallback : value;
    return Math.max(0, Math.min(100, number));
  }

  private String sha256Hex(String raw) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new TtsException("生成缓存键失败", e);
    }
  }

  @PreDestroy
  public void shutdown() {
    executor.shutdownNow();
  }

  private record NormalizedParams(
    String text,
    String vcn,
    int speed,
    int volume,
    int pitch,
    String fileName
  ) {}
}
