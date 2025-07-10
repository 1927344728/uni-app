package com.lizhao.unispringboot.authority;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthorityFilter extends OncePerRequestFilter {
  private static final Logger logger = LoggerFactory.getLogger(AuthorityFilter.class);

  @Autowired
  private JwtUtil jwtUtil = new JwtUtil();

  @Autowired
  private UserDetailsServiceImpl userDetailsService;

  @Autowired
  private AuthorityConfigProperties securityConfig;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    try {
      String token = parseJwt(request);
      Boolean isPublicPath = securityConfig.isPublicPath(request.getServletPath());
      if (!isPublicPath && (token == null || !jwtUtil.validateToken(token))) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"请登录\"}");
        return;
      }
      Claims claims = jwtUtil.parseToken(token);
      String username = claims.getSubject();
      UserDetails userDetails = userDetailsService.loadUserByUsername(username);
      UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities());
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (Exception e) {
      logger.error("用户授权失败: {}", e.getMessage());
    }

    filterChain.doFilter(request, response);
  }

  private String parseJwt(HttpServletRequest request) {
    Cookie cookies [] = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if (cookie.getName().equals("token") && cookie.getValue() != null) {
          return cookie.getValue();
        }
      }
    }

    return null;
  }
}