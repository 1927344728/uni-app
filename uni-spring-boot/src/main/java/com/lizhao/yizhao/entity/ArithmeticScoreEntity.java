package com.lizhao.yizhao.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "arithmetic_score", indexes = {
    @Index(name = "idx_arithmetic_score_user", columnList = "user_id"),
    @Index(name = "idx_arithmetic_score_user_best", columnList = "user_id, score, duration_ms")
})
public class ArithmeticScoreEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(nullable = false, length = 32)
  private String mode;

  @Column(nullable = false)
  private Integer score;

  @Column(name = "max_score", nullable = false)
  private Integer maxScore;

  @Column(nullable = false)
  private Integer correct;

  @Column(nullable = false)
  private Integer total;

  @Column(name = "duration_ms", nullable = false)
  private Integer durationMs;

  @CreationTimestamp
  @Column(name = "created_time", nullable = false, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  public ArithmeticScoreEntity() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public Integer getScore() {
    return score;
  }

  public void setScore(Integer score) {
    this.score = score;
  }

  public Integer getMaxScore() {
    return maxScore;
  }

  public void setMaxScore(Integer maxScore) {
    this.maxScore = maxScore;
  }

  public Integer getCorrect() {
    return correct;
  }

  public void setCorrect(Integer correct) {
    this.correct = correct;
  }

  public Integer getTotal() {
    return total;
  }

  public void setTotal(Integer total) {
    this.total = total;
  }

  public Integer getDurationMs() {
    return durationMs;
  }

  public void setDurationMs(Integer durationMs) {
    this.durationMs = durationMs;
  }

  public Instant getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(Instant createdTime) {
    this.createdTime = createdTime;
  }
}
