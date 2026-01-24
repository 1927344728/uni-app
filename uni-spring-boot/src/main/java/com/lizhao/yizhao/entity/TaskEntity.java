package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;

@Entity
@Table(name = "task")
public class TaskEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = true)
  private Integer status;

  @Column(nullable = true, length = 100)
  private String publisher;

  @Column(nullable = true, length = 100)
  private String targeter;

  @Column(nullable = true, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = true)
  private Integer seq;

  @Column(nullable = true)
  private Integer progress;

  @Column(nullable = true, columnDefinition = "TEXT")
  private String finished;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object awards;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object attachments;

  @Column(nullable = true, columnDefinition = "JSON")
  @JsonRawValue
  private Object works;

  @Column(name = "publish_time", nullable = true)
  private Long publishTime;

  @Column(name = "start_time", nullable = true)
  private Long startTime;

  @Column(name = "end_time", nullable = true)
  private Long endTime;

  @Column(name = "created_time", nullable = true, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = true)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public TaskEntity() {}

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }

  public Integer getStatus() {
    return status;
  }
  public void setStatus(Integer status) {
    this.status = status;
  }

  public String getPublisher() {
    return publisher;
  }
  public void setPublisher(String publisher) {
    this.publisher = publisher;
  }

  public String getTargeter() {
    return targeter;
  }
  public void setTargeter(String targeter) {
    this.targeter = targeter;
  }

  public String getContent() {
    return content;
  }
  public void setContent(String content) {
    this.content = content;
  }

  public Integer getSeq() {
    return seq;
  }
  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public Integer getProgress() {
    return progress;
  }
  public void setProgress(Integer progress) {
    this.progress = progress;
  }

  public String getFinished() {
    return finished;
  }
  public void setFinished(String finished) {
    this.finished = finished;
  }

  public Object getAwards() {
    return awards;
  }
  public void setAwards(Object awards) {
    this.awards = awards;
  }

  public Object getAttachments() {
    return attachments;
  }
  public void setAttachments(Object attachments) {
    this.attachments = attachments;
  }

  public Object getWorks() {
    return works;
  }
  public void setWorks(Object works) {
    this.works = works;
  }

  public Long getPublishTime() {
    return publishTime;
  }
  public void setPublishTime(Long publishTime) {
    this.publishTime = publishTime;
  }

  public Long getStartTime() {
    return startTime;
  }
  public void setStartTime(Long startTime) {
    this.startTime = startTime;
  }

  public Long getEndTime() {
    return endTime;
  }
  public void setEndTime(Long endTime) {
    this.endTime = endTime;
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