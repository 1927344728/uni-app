package com.lizhao.unispringboot.authority;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "security") // 从 application.properties 读取
public class AuthorityConfigProperties {
  // 默认公开路径（如果 application.propertiesl 未配置，则使用这些默认值）
  private List<String> publicPaths = Arrays.asList(
    "/api/auth/**",
    "/api/hello/**",
    "/api/test/**"
  );

  // Getter & Setter
  public List<String> getPublicPaths() {
    return publicPaths;
  }

  public void setPublicPaths(List<String> publicPaths) {
    this.publicPaths = publicPaths;
  }

  public boolean isPublicPath(String requestPath) {
    return publicPaths.stream().anyMatch(path -> requestPath.startsWith(path.replace("/**", "")));
  }
}