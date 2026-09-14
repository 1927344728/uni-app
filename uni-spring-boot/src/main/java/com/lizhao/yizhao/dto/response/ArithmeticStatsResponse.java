package com.lizhao.yizhao.dto.response;

public class ArithmeticStatsResponse {
  private Integer level;
  private String levelName;
  private Integer bestScore;
  private Integer bestDurationMs;
  private Long perfectCount;
  private Long kingPerfectCount;

  public Integer getLevel() {
    return level;
  }

  public void setLevel(Integer level) {
    this.level = level;
  }

  public String getLevelName() {
    return levelName;
  }

  public void setLevelName(String levelName) {
    this.levelName = levelName;
  }

  public Integer getBestScore() {
    return bestScore;
  }

  public void setBestScore(Integer bestScore) {
    this.bestScore = bestScore;
  }

  public Integer getBestDurationMs() {
    return bestDurationMs;
  }

  public void setBestDurationMs(Integer bestDurationMs) {
    this.bestDurationMs = bestDurationMs;
  }

  public Long getPerfectCount() {
    return perfectCount;
  }

  public void setPerfectCount(Long perfectCount) {
    this.perfectCount = perfectCount;
  }

  public Long getKingPerfectCount() {
    return kingPerfectCount;
  }

  public void setKingPerfectCount(Long kingPerfectCount) {
    this.kingPerfectCount = kingPerfectCount;
  }
}
