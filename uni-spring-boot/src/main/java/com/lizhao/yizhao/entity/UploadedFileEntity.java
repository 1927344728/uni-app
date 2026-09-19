package com.lizhao.yizhao.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "uploaded_file")
public class UploadedFileEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "original_name", nullable = false, length = 255)
  private String originalName;

  @Column(name = "object_key", nullable = false, length = 850)
  private String objectKey;

  @Column(name = "url", nullable = false, length = 1000)
  private String url;

  @Column(name = "file_type", nullable = false, length = 32)
  private String fileType;

  @Column(name = "mime_type", length = 128)
  private String mimeType;

  @Column(name = "size_bytes")
  private Long sizeBytes;

  @Column(name = "dir", length = 255)
  private String dir;

  /** 创建时间，毫秒时间戳 */
  @Column(name = "created_time")
  private Long createdTime;

  /** 更新时间，毫秒时间戳 */
  @Column(name = "updated_time")
  private Long updatedTime;

  @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
  private Boolean isDeleted;

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getOriginalName() {
    return originalName;
  }

  public void setOriginalName(String originalName) {
    this.originalName = originalName;
  }

  public String getObjectKey() {
    return objectKey;
  }

  public void setObjectKey(String objectKey) {
    this.objectKey = objectKey;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public String getFileType() {
    return fileType;
  }

  public void setFileType(String fileType) {
    this.fileType = fileType;
  }

  public String getMimeType() {
    return mimeType;
  }

  public void setMimeType(String mimeType) {
    this.mimeType = mimeType;
  }

  public Long getSizeBytes() {
    return sizeBytes;
  }

  public void setSizeBytes(Long sizeBytes) {
    this.sizeBytes = sizeBytes;
  }

  public String getDir() {
    return dir;
  }

  public void setDir(String dir) {
    this.dir = dir;
  }

  public Long getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(Long createdTime) {
    this.createdTime = createdTime;
  }

  public Long getUpdatedTime() {
    return updatedTime;
  }

  public void setUpdatedTime(Long updatedTime) {
    this.updatedTime = updatedTime;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }

  public void setIsDeleted(Boolean isDeleted) {
    this.isDeleted = isDeleted;
  }
}
