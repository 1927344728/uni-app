package com.lizhao.yizhao.service;

import com.lizhao.yizhao.config.TencentCosProperties;
import com.lizhao.yizhao.dto.response.CosUploadResponse;
import com.lizhao.yizhao.exception.CosException;
import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.http.HttpProtocol;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class CosStorageService {
  private static final Logger logger = LoggerFactory.getLogger(CosStorageService.class);
  private static final int MAX_KEY_BYTES = 850;
  private static final String DEFAULT_DIR = "uploads";
  private static final String CONTENT_ADDRESSED_CACHE_CONTROL = "public, max-age=31536000, immutable";
  private static final String DEFAULT_CACHE_CONTROL = "public, max-age=86400";

  private final TencentCosProperties properties;
  private volatile COSClient cosClient;

  public CosStorageService(TencentCosProperties properties) {
    this.properties = properties;
  }

  public boolean exists(String objectKey) {
    try {
      return getClient().doesObjectExist(properties.getBucket(), sanitizeObjectKey(objectKey));
    } catch (CosException e) {
      throw e;
    } catch (Exception e) {
      throw new CosException("检查文件是否存在失败: " + e.getMessage(), e);
    }
  }

  public void delete(String objectKey) {
    String key = sanitizeObjectKey(objectKey);
    try {
      getClient().deleteObject(properties.getBucket(), key);
      logger.info("COS deleted, key={}", key);
    } catch (CosException e) {
      throw e;
    } catch (Exception e) {
      throw new CosException("删除文件失败: " + e.getMessage(), e);
    }
  }

  public void upload(String objectKey, byte[] bytes, String contentType) {
    upload(objectKey, bytes, contentType, "public, max-age=86400");
  }

  public void upload(String objectKey, byte[] bytes, String contentType, String cacheControl) {
    if (bytes == null || bytes.length == 0) {
      throw new CosException("上传文件失败：内容为空");
    }
    try (ByteArrayInputStream input = new ByteArrayInputStream(bytes)) {
      upload(objectKey, input, bytes.length, contentType, cacheControl);
    } catch (IOException e) {
      throw new CosException("上传文件失败", e);
    }
  }

  public void upload(String objectKey, InputStream input, long contentLength, String contentType, String cacheControl) {
    if (input == null || contentLength <= 0) {
      throw new CosException("上传文件失败：内容为空");
    }
    String key = sanitizeObjectKey(objectKey);
    ObjectMetadata metadata = new ObjectMetadata();
    metadata.setContentLength(contentLength);
    metadata.setContentType(StringUtils.hasText(contentType) ? contentType : "application/octet-stream");
    if (StringUtils.hasText(cacheControl)) {
      metadata.setCacheControl(cacheControl);
    }
    PutObjectRequest request = new PutObjectRequest(
      properties.getBucket(),
      key,
      input,
      metadata
    );
    try {
      getClient().putObject(request);
    } catch (CosException e) {
      throw e;
    } catch (Exception e) {
      throw new CosException("上传文件失败: " + e.getMessage(), e);
    }
  }

  public CosUploadResponse upload(
    MultipartFile file,
    String dir,
    String fileName,
    String key,
    boolean overwrite
  ) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("请选择要上传的文件");
    }

    boolean contentAddressed = !StringUtils.hasText(key);
    String objectKey = contentAddressed
      ? buildObjectKey(
        StringUtils.hasText(dir) ? dir : DEFAULT_DIR,
        contentAddressedFileName(file, fileName)
      )
      : sanitizeObjectKey(key);

    if (!overwrite && exists(objectKey)) {
      logger.info("COS skip duplicate, key={}", objectKey);
      return new CosUploadResponse(publicUrl(objectKey), objectKey, false);
    }

    String cacheControl = contentAddressed ? CONTENT_ADDRESSED_CACHE_CONTROL : DEFAULT_CACHE_CONTROL;
    try (InputStream input = file.getInputStream()) {
      upload(objectKey, input, file.getSize(), file.getContentType(), cacheControl);
    } catch (IOException e) {
      throw new CosException("读取上传文件失败", e);
    }
    return new CosUploadResponse(publicUrl(objectKey), objectKey, true);
  }

  public String publicUrl(String objectKey) {
    String base = trimSlash(properties.getPublicBaseUrl());
    String key = sanitizeObjectKey(objectKey);
    return base + "/" + key;
  }

  public String buildObjectKey(String dir, String fileName) {
    String prefix = trimSlash(dir);
    String name = sanitizeFileName(fileName);
    if (!StringUtils.hasText(prefix)) {
      return sanitizeObjectKey(name);
    }
    return sanitizeObjectKey(prefix + "/" + name);
  }

  public String sanitizeObjectKey(String objectKey) {
    if (!StringUtils.hasText(objectKey)) {
      throw new IllegalArgumentException("对象路径不能为空");
    }
    String normalized = objectKey.replace('\\', '/').trim();
    while (normalized.startsWith("/")) {
      normalized = normalized.substring(1);
    }
    while (normalized.contains("//")) {
      normalized = normalized.replace("//", "/");
    }
    if (!StringUtils.hasText(normalized) || normalized.endsWith("/")) {
      throw new IllegalArgumentException("对象路径不合法");
    }
    String[] segments = normalized.split("/");
    StringBuilder builder = new StringBuilder();
    for (String segment : segments) {
      if (!StringUtils.hasText(segment) || ".".equals(segment) || "..".equals(segment)) {
        throw new IllegalArgumentException("对象路径不合法");
      }
      if (segment.indexOf('\0') >= 0) {
        throw new IllegalArgumentException("对象路径不合法");
      }
      if (builder.length() > 0) {
        builder.append('/');
      }
      builder.append(segment);
    }
    String key = builder.toString();
    if (key.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > MAX_KEY_BYTES) {
      throw new IllegalArgumentException("对象路径过长");
    }
    return key;
  }

  private String sanitizeFileName(String fileName) {
    if (!StringUtils.hasText(fileName)) {
      throw new IllegalArgumentException("文件名不能为空");
    }
    String name = fileName.replace('\\', '/').trim();
    int slash = name.lastIndexOf('/');
    if (slash >= 0) {
      name = name.substring(slash + 1);
    }
    if (!StringUtils.hasText(name) || ".".equals(name) || "..".equals(name) || name.indexOf('\0') >= 0) {
      throw new IllegalArgumentException("文件名不合法");
    }
    return name;
  }

  private String contentAddressedFileName(MultipartFile file, String preferredFileName) {
    String sourceName = StringUtils.hasText(file.getOriginalFilename())
      ? file.getOriginalFilename()
      : preferredFileName;
    return md5Hex(file) + extractExtension(sourceName);
  }

  private String extractExtension(String originalFilename) {
    if (!StringUtils.hasText(originalFilename)) {
      return "";
    }
    try {
      String name = sanitizeFileName(originalFilename);
      int dot = name.lastIndexOf('.');
      if (dot > 0 && dot < name.length() - 1) {
        return name.substring(dot).toLowerCase(Locale.ROOT);
      }
    } catch (IllegalArgumentException ignored) {
      return "";
    }
    return "";
  }

  private String md5Hex(MultipartFile file) {
    try {
      MessageDigest digest = MessageDigest.getInstance("MD5");
      try (InputStream input = file.getInputStream()) {
        byte[] buffer = new byte[8192];
        int read;
        while ((read = input.read(buffer)) != -1) {
          digest.update(buffer, 0, read);
        }
      }
      return HexFormat.of().formatHex(digest.digest());
    } catch (Exception e) {
      throw new CosException("计算文件指纹失败: " + e.getMessage(), e);
    }
  }

  private COSClient getClient() {
    if (!properties.isConfigured()) {
      throw new CosException("未配置腾讯云 COS 密钥，请在 application-local.properties 中设置 tencent.cos.secret-id / tencent.cos.secret-key");
    }
    if (cosClient == null) {
      synchronized (this) {
        if (cosClient == null) {
          COSCredentials credentials = new BasicCOSCredentials(
            properties.getSecretId(),
            properties.getSecretKey()
          );
          ClientConfig clientConfig = new ClientConfig(new Region(properties.getRegion()));
          clientConfig.setHttpProtocol(HttpProtocol.https);
          cosClient = new COSClient(credentials, clientConfig);
        }
      }
    }
    return cosClient;
  }

  private String trimSlash(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    String trimmed = value.trim();
    while (trimmed.endsWith("/")) {
      trimmed = trimmed.substring(0, trimmed.length() - 1);
    }
    while (trimmed.startsWith("/")) {
      trimmed = trimmed.substring(1);
    }
    return trimmed;
  }

  @PreDestroy
  public void shutdown() {
    if (cosClient != null) {
      cosClient.shutdown();
    }
  }
}
