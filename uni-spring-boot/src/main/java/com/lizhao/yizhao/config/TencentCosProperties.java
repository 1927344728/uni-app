package com.lizhao.yizhao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "tencent.cos")
public class TencentCosProperties {
  private String secretId;
  private String secretKey;
  private String region = "ap-shanghai";
  private String bucket = "yizhao-1259410276";
  private String publicBaseUrl = "https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com";

  public boolean isConfigured() {
    return StringUtils.hasText(secretId) && StringUtils.hasText(secretKey);
  }

  public String getSecretId() {
    return secretId;
  }

  public void setSecretId(String secretId) {
    this.secretId = secretId;
  }

  public String getSecretKey() {
    return secretKey;
  }

  public void setSecretKey(String secretKey) {
    this.secretKey = secretKey;
  }

  public String getRegion() {
    return region;
  }

  public void setRegion(String region) {
    this.region = region;
  }

  public String getBucket() {
    return bucket;
  }

  public void setBucket(String bucket) {
    this.bucket = bucket;
  }

  public String getPublicBaseUrl() {
    return publicBaseUrl;
  }

  public void setPublicBaseUrl(String publicBaseUrl) {
    this.publicBaseUrl = publicBaseUrl;
  }
}
