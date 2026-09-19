package com.lizhao.yizhao.service;

import com.lizhao.yizhao.dto.response.CosUploadResponse;
import com.lizhao.yizhao.entity.UploadedFileEntity;
import com.lizhao.yizhao.exception.CosException;
import com.lizhao.yizhao.repository.UploadedFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Optional;

@Service
public class UploadedFileService {
  private static final String DEFAULT_DIR = "admin/uploads";

  private final CosStorageService cosStorageService;
  private final UploadedFileRepository uploadedFileRepository;

  public UploadedFileService(CosStorageService cosStorageService, UploadedFileRepository uploadedFileRepository) {
    this.cosStorageService = cosStorageService;
    this.uploadedFileRepository = uploadedFileRepository;
  }

  public UploadedFileEntity upload(MultipartFile file, String dir) {
    String resolvedDir = StringUtils.hasText(dir) ? dir.trim() : DEFAULT_DIR;
    CosUploadResponse uploaded = cosStorageService.upload(file, resolvedDir, null, null, false);

    long now = System.currentTimeMillis();
    UploadedFileEntity entity = new UploadedFileEntity();
    entity.setOriginalName(resolveOriginalName(file));
    entity.setObjectKey(uploaded.getKey());
    entity.setUrl(uploaded.getUrl());
    entity.setFileType(resolveFileType(file));
    entity.setMimeType(StringUtils.hasText(file.getContentType()) ? file.getContentType() : null);
    entity.setSizeBytes(file.getSize() > 0 ? file.getSize() : null);
    entity.setDir(resolvedDir);
    entity.setCreatedTime(now);
    entity.setUpdatedTime(now);
    entity.setIsDeleted(false);
    return uploadedFileRepository.save(entity);
  }

  public Optional<UploadedFileEntity> findById(Integer id) {
    return uploadedFileRepository.findById(id);
  }

  /** 删除 COS 对象并硬删除数据库记录，不可恢复 */
  public void deletePermanently(UploadedFileEntity entity) {
    String objectKey = resolveObjectKey(entity);
    if (StringUtils.hasText(objectKey)) {
      try {
        cosStorageService.delete(objectKey);
      } catch (CosException e) {
        // COS 上已不存在时仍继续删库，避免脏数据卡住
        if (!isObjectNotFound(e)) {
          throw e;
        }
      }
    }
    uploadedFileRepository.deleteById(entity.getId());
  }

  private String resolveObjectKey(UploadedFileEntity entity) {
    if (StringUtils.hasText(entity.getObjectKey())) {
      return entity.getObjectKey().trim();
    }
    String url = entity.getUrl();
    if (!StringUtils.hasText(url)) {
      return null;
    }
    try {
      String path = java.net.URI.create(url.trim()).getPath();
      if (!StringUtils.hasText(path)) {
        return null;
      }
      while (path.startsWith("/")) {
        path = path.substring(1);
      }
      return StringUtils.hasText(path) ? path : null;
    } catch (Exception e) {
      return null;
    }
  }

  private boolean isObjectNotFound(CosException e) {
    Throwable cause = e.getCause();
    String message = e.getMessage() == null ? "" : e.getMessage();
    String causeMessage = cause == null || cause.getMessage() == null ? "" : cause.getMessage();
    String text = (message + " " + causeMessage).toLowerCase(Locale.ROOT);
    return text.contains("nosuchkey")
        || text.contains("404")
        || text.contains("not exist")
        || text.contains("not found")
        || text.contains("no such key");
  }

  public static String resolveFileType(MultipartFile file) {
    String contentType = file.getContentType();
    if (StringUtils.hasText(contentType)) {
      String lower = contentType.toLowerCase(Locale.ROOT);
      if (lower.startsWith("image/")) return "image";
      if (lower.startsWith("audio/")) return "audio";
      if (lower.startsWith("video/")) return "video";
    }
    String name = resolveOriginalName(file).toLowerCase(Locale.ROOT);
    if (name.matches(".*\\.(png|jpe?g|gif|webp|bmp|svg|ico)$")) return "image";
    if (name.matches(".*\\.(mp3|wav|flac|aac|m4a|ogg|wma)$")) return "audio";
    if (name.matches(".*\\.(mp4|webm|mov|avi|mkv|m4v)$")) return "video";
    return "other";
  }

  private static String resolveOriginalName(MultipartFile file) {
    if (file != null && StringUtils.hasText(file.getOriginalFilename())) {
      String name = file.getOriginalFilename().replace('\\', '/');
      int slash = name.lastIndexOf('/');
      if (slash >= 0) name = name.substring(slash + 1);
      if (StringUtils.hasText(name)) return name;
    }
    return "untitled";
  }
}
