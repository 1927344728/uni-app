package com.lizhao.yizhao.config.authority;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AuthorityCorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      // 替换为你的前端实际域名，不要用"*"
      .allowedOrigins(
        "http://izhao.com.cn",
        "http://dev.izhao.com.cn:9000",
        "http://localhost:9000",
        "https://izhao.com.cn",
        "https://app.izhao.com.cn",
        "https://www.izhao.com.cn",
        "https://dev.izhao.com.cn:9000",
        "https://localhost:9000"
      )
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
      .allowedHeaders("*")
      // 允许携带凭证（cookies等）
      .allowCredentials(true)
      // 预检请求缓存时间（单位：秒）
      .maxAge(60 * 60 * 24);
  }
}