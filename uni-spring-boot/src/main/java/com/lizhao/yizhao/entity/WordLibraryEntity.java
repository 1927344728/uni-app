package com.lizhao.yizhao.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "word_library")
public class WordLibraryEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "grade_id")
  private Integer gradeId;

  @Column(columnDefinition = "TEXT")
  private String words;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public WordLibraryEntity() {}

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public Integer getGradeId() {
    return gradeId;
  }

  public void setGradeId(Integer gradeId) {
    this.gradeId = gradeId;
  }

  public String getWords() {
    return words;
  }

  public void setWords(String words) {
    this.words = words;
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
