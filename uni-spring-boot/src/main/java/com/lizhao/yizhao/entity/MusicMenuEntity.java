package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;

@Entity
@Table(name = "music_menu")
public class MusicMenuEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = true, length = 500)
  private String icon;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = true, length = 500)
  private String desc;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object songIds;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public MusicMenuEntity() {}

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }

  public String getIcon() {
    return icon;
  }
  public void setIcon(String icon) {
    this.icon = icon;
  }

  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }

  public String getDesc() {
    return desc;
  }
  public void setDesc(String desc) {
    this.desc = desc;
  }

  public Object getSongIds() {
    return songIds;
  }
  public void setSongIds(Object songIds) {
    this.songIds = songIds;
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