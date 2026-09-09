package com.lizhao.yizhao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "xfyun.tts")
public class XfTtsProperties {
  private String appId;
  private String apiKey;
  private String apiSecret;
  private String host = "tts-api.xfyun.cn";
  private String baseUrl = "wss://tts-api.xfyun.cn/v2/tts";
  private String aue = "lame";
  private int sfl = 1;
  private String auf = "audio/L16;rate=16000";
  private String vcn = "x4_xiaoyan";
  private int speed = 50;
  private int volume = 50;
  private int pitch = 50;
  private int bgs = 0;
  private String tte = "UTF8";
  private String reg = "0";
  private String rdn = "0";
  private long timeoutMs = 30000;

  public String getAppId() {
    return appId;
  }

  public void setAppId(String appId) {
    this.appId = appId;
  }

  public String getApiKey() {
    return apiKey;
  }

  public void setApiKey(String apiKey) {
    this.apiKey = apiKey;
  }

  public String getApiSecret() {
    return apiSecret;
  }

  public void setApiSecret(String apiSecret) {
    this.apiSecret = apiSecret;
  }

  public String getHost() {
    return host;
  }

  public void setHost(String host) {
    this.host = host;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public String getAue() {
    return aue;
  }

  public void setAue(String aue) {
    this.aue = aue;
  }

  public int getSfl() {
    return sfl;
  }

  public void setSfl(int sfl) {
    this.sfl = sfl;
  }

  public String getAuf() {
    return auf;
  }

  public void setAuf(String auf) {
    this.auf = auf;
  }

  public String getVcn() {
    return vcn;
  }

  public void setVcn(String vcn) {
    this.vcn = vcn;
  }

  public int getSpeed() {
    return speed;
  }

  public void setSpeed(int speed) {
    this.speed = speed;
  }

  public int getVolume() {
    return volume;
  }

  public void setVolume(int volume) {
    this.volume = volume;
  }

  public int getPitch() {
    return pitch;
  }

  public void setPitch(int pitch) {
    this.pitch = pitch;
  }

  public int getBgs() {
    return bgs;
  }

  public void setBgs(int bgs) {
    this.bgs = bgs;
  }

  public String getTte() {
    return tte;
  }

  public void setTte(String tte) {
    this.tte = tte;
  }

  public String getReg() {
    return reg;
  }

  public void setReg(String reg) {
    this.reg = reg;
  }

  public String getRdn() {
    return rdn;
  }

  public void setRdn(String rdn) {
    this.rdn = rdn;
  }

  public long getTimeoutMs() {
    return timeoutMs;
  }

  public void setTimeoutMs(long timeoutMs) {
    this.timeoutMs = timeoutMs;
  }
}
