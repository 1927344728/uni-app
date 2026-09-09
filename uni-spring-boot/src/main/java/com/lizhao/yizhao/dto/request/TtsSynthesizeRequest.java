package com.lizhao.yizhao.dto.request;

public class TtsSynthesizeRequest {
  private String text;
  private String vcn;
  private Integer speed;
  private Integer volume;
  private Integer pitch;

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public String getVcn() {
    return vcn;
  }

  public void setVcn(String vcn) {
    this.vcn = vcn;
  }

  public Integer getSpeed() {
    return speed;
  }

  public void setSpeed(Integer speed) {
    this.speed = speed;
  }

  public Integer getVolume() {
    return volume;
  }

  public void setVolume(Integer volume) {
    this.volume = volume;
  }

  public Integer getPitch() {
    return pitch;
  }

  public void setPitch(Integer pitch) {
    this.pitch = pitch;
  }
}
