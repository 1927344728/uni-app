package com.lizhao.yizhao.dto.response;

public class CosUploadResponse {
  private String url;
  private String key;
  private boolean uploaded;

  public CosUploadResponse() {}

  public CosUploadResponse(String url, String key, boolean uploaded) {
    this.url = url;
    this.key = key;
    this.uploaded = uploaded;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public boolean isUploaded() {
    return uploaded;
  }

  public void setUploaded(boolean uploaded) {
    this.uploaded = uploaded;
  }
}
