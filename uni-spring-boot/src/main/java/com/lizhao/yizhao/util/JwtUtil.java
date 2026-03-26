package com.lizhao.yizhao.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
  private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

  // 使用安全的密钥（生产环境应从配置读取）
  private static final byte[] SECRET = "8af87d1df85b11f094dab4a9fc7c4063".getBytes();
  private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET);
  private static final long EXPIRATION_HOURS = 24 * 30; // 30天过期

  public String generateToken(String phone) {
    return Jwts.builder()
      .subject(phone)
      .issuedAt(Date.from(Instant.now()))
      .expiration(Date.from(Instant.now().plus(EXPIRATION_HOURS, ChronoUnit.HOURS)))
      .signWith(SECRET_KEY)
      .compact();
  }

  public Claims parseToken(String token) {
    return Jwts.parser()
      .verifyWith(SECRET_KEY)
      .build()
      .parseSignedClaims(token)
      .getPayload();
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser()
        .verifyWith(SECRET_KEY)
        .build()
        .parseSignedClaims(token);
      return true;
    } catch (ExpiredJwtException e) {
      logger.error("Token 已过期: {}", e.getMessage());
    } catch (UnsupportedJwtException e) {
      logger.error("不支持的 Token 格式: {}", e.getMessage());
    } catch (MalformedJwtException e) {
      logger.error("无效的 Token 结构: {}", e.getMessage());
    } catch (JwtException | IllegalArgumentException e) {
      logger.error("Token 解析错误: {}", e.getMessage());
    }
    return false;
  }
}