package com.lizhao.yizhao.dto.request;

public class ArithmeticScoreRequest {
  private String mode;
  private Integer score;
  private Integer maxScore;
  private Integer correct;
  private Integer total;
  private Integer durationMs;

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
}
