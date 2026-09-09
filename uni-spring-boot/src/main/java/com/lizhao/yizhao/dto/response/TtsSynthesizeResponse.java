package com.lizhao.yizhao.dto.response;

public class TtsSynthesizeResponse {
  private String url;
  private boolean cached;

  public TtsSynthesizeResponse() {}

  public TtsSynthesizeResponse(String url, boolean cached) {
    this.url = url;
    this.cached = cached;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public boolean isCached() {
    return cached;
  }

  public void setCached(boolean cached) {
    this.cached = cached;
  }
}
