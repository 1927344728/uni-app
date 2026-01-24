package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "music", uniqueConstraints = {
    @UniqueConstraint(columnNames = "uuid"),
    @UniqueConstraint(columnNames = "url")
})
public class MusicEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 32)
  private String uuid;

  @Column(nullable = true, length = 50)
  private String type;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = true, length = 255)
  private String singer;

  @Column(nullable = true, length = 500)
  private String fileName;

  @Column(nullable = true, columnDefinition = "TEXT")
  private String desc;

  @Column(nullable = true)
  private Integer seq;

  @Column(nullable = false, length = 500)
  private String url;

  @Column(nullable = true, length = 500)
  private String cover;

  @Column(nullable = true, length = 500)
  private String lyric;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public MusicEntity() {}

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }

  public String getUuid() {
    return uuid;
  }
  public void setUuid(String uuid) {
    this.uuid = uuid;
  }

  public String getType() {
    return type;
  }
  public void setType(String type) {
    this.type = type;
  }

  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }

  public String getSinger() {
    return singer;
  }
  public void setSinger(String singer) {
    this.singer = singer;
  }

  public String getFileName() {
    return fileName;
  }
  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public String getDesc() {
    return desc;
  }
  public void setDesc(String desc) {
    this.desc = desc;
  }

  public Integer getSeq() {
    return seq;
  }
  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public String getUrl() {
    return url;
  }
  public void setUrl(String url) {
    this.url = url;
  }

  public String getCover() {
    return cover;
  }
  public void setCover(String cover) {
    this.cover = cover;
  }

  public String getLyric() {
    return lyric;
  }
  public void setLyric(String lyric) {
    this.lyric = lyric;
  }

  public Instant getCreatedTime() {
    return createdTime;
  }
  public void setCreatedTime(Instant createdTime) {
    this.createdTime = createdTime;
  }

  public Instant getUpdatedTime() {
    return updatedTime;
  }
  public void setUpdatedTime(Instant updatedTime) {
    this.updatedTime = updatedTime;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }
  public void setIsDeleted(Boolean isDeleted) {
    this.isDeleted = isDeleted;
  }
}