package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;

@Entity
@Table(name = "book", uniqueConstraints = {
    @UniqueConstraint(columnNames = "uuid")
})
public class BookEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 32)
  private String uuid;

  @Column(nullable = true, length = 50)
  private String type;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = true, length = 100)
  private String author;

  @Column(nullable = true, length = 100)
  private String owner;

  @Column(nullable = true, precision = 3, scale = 1)
  private BigDecimal score;

  @Column(nullable = true)
  private Integer seq;

  @Column(nullable = true, length = 500)
  private String cover;

  @Column(nullable = true, columnDefinition = "TEXT")
  private String description;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object summaries;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object tags;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object highlights;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public BookEntity() {}

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

  public String getAuthor() {
    return author;
  }
  public void setAuthor(String author) {
    this.author = author;
  }

  public String getOwner() {
    return owner;
  }
  public void setOwner(String owner) {
    this.owner = owner;
  }

  public BigDecimal getScore() {
    return score;
  }
  public void setScore(BigDecimal score) {
    this.score = score;
  }

  public Integer getSeq() {
    return seq;
  }
  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public String getCover() {
    return cover;
  }
  public void setCover(String cover) {
    this.cover = cover;
  }

  public String getDescription() {
    return description;
  }
  public void setDescription(String description) {
    this.description = description;
  }

  public Object getSummaries() {
    return summaries;
  }
  public void setSummaries(Object summaries) {
    this.summaries = summaries;
  }

  public Object getTags() {
    return tags;
  }
  public void setTags(Object tags) {
    this.tags = tags;
  }

  public Object getHighlights() {
    return highlights;
  }
  public void setHighlights(Object highlights) {
    this.highlights = highlights;
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