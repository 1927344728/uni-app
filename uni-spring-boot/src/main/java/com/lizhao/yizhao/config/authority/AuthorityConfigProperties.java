package com.lizhao.yizhao.config.authority;

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

  // 生产可保持开启；本地必须关掉，否则 Chrome 会把整个 dev.izhao.com.cn（含 Vite 9000）锁死
  private boolean hstsEnabled = true;

  // Getter & Setter
  public List<String> getPublicPaths() {
    return publicPaths;
  }

  public void setPublicPaths(List<String> publicPaths) {
    this.publicPaths = publicPaths;
  }

  public boolean isHstsEnabled() {
    return hstsEnabled;
  }

  public void setHstsEnabled(boolean hstsEnabled) {
    this.hstsEnabled = hstsEnabled;
  }

  public boolean isPublicPath(String requestPath) {
    return publicPaths.stream().anyMatch(path -> requestPath.startsWith(path.replace("/**", "")));
  }
}