package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;

@Entity
@Table(name = "article", uniqueConstraints = {
    @UniqueConstraint(columnNames = "uuid")
})
public class ArticleEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 32)
  private String uuid;

  @Column(nullable = true, length = 50)
  private String type;

  @Column(nullable = true)
  private Integer subType;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = true, length = 100)
  private String author;

  @Column(nullable = true, columnDefinition = "TEXT")
  private String note;

  @Column(nullable = true)
  private Integer seq;

  @Column(nullable = true, length = 100)
  private String className;

  @Column(nullable = true, length = 500)
  private String thumb;

  @Column(nullable = true, length = 500)
  private String url;

  @Column(nullable = true, length = 20)
  private String jumpTo;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object content;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public ArticleEntity() {}

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

  public Integer getSubType() {
    return subType;
  }
  public void setSubType(Integer subType) {
    this.subType = subType;
  }

  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }

  public String getAuthor() {
    return author;
  }
  public void setAuthor(String author) {
    this.author = author;
  }

  public String getNote() {
    return note;
  }
  public void setNote(String note) {
    this.note = note;
  }

  public Integer getSeq() {
    return seq;
  }
  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public String getClassName() {
    return className;
  }
  public void setClassName(String className) {
    this.className = className;
  }

  public String getThumb() {
    return thumb;
  }
  public void setThumb(String thumb) {
    this.thumb = thumb;
  }

  public String getUrl() {
    return url;
  }
  public void setUrl(String url) {
    this.url = url;
  }

  public String getJumpTo() {
    return jumpTo;
  }
  public void setJumpTo(String jumpTo) {
    this.jumpTo = jumpTo;
  }

  public Object getContent() {
    return content;
  }
  public void setContent(Object content) {
    this.content = content;
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