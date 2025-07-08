package com.lizhao.unispringboot.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

public class JwtUtil {
  private static final byte[] SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded();
  private static final long EXPIRATION_TIME = 86400000; // 24小时

  public static String generateToken(String phone) {
    return Jwts.builder()
      .setSubject(phone)
      .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
      .signWith(Keys.hmacShaKeyFor(SECRET_KEY))
      .compact();
  }
}