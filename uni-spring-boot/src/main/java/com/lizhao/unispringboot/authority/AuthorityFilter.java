package com.lizhao.unispringboot.authority;

import com.lizhao.unispringboot.common.ResponseResult;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class AuthorityFilter extends OncePerRequestFilter {
  private static final Logger logger = LoggerFactory.getLogger(AuthorityFilter.class);

  @Autowired
  private JwtUtil jwtUtil = new JwtUtil();

  @Autowired
  private UserDetailsServiceImpl userDetailsService;

  @Autowired
  private AuthorityConfigProperties securityConfig;

  @Autowired
  private ApplicationContext applicationContext;

  private final ObjectMapper objectMapper = new ObjectMapper();

  private Set<String> registeredPaths;

  @Override
  public void afterPropertiesSet() throws ServletException {
    super.afterPropertiesSet();
    // 获取所有已注册的接口路径
    RequestMappingHandlerMapping mapping = applicationContext.getBean(RequestMappingHandlerMapping.class);
    registeredPaths = mapping.getHandlerMethods().keySet().stream()
      .flatMap(p -> p.getPatternValues().stream())
      .collect(java.util.stream.Collectors.toSet());
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    try {
      // 检查请求路径是否已注册
      String requestPath = request.getServletPath();
      if (!registeredPaths.contains(requestPath)) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.setContentType("application/json;charset=UTF-8");
        ResponseResult<Void> result = ResponseResult.fail(HttpServletResponse.SC_NOT_FOUND, "请求路径未找到");
        response.getWriter().write(objectMapper.writeValueAsString(result));
        return;
      }

      // 检查请求是否有有效 token
      String token = parseJwt(request);
      Boolean isPublicPath = securityConfig.isPublicPath(request.getServletPath());
      Boolean isValidToken = token != null && jwtUtil.validateToken(token);
      if (!isPublicPath && !isValidToken) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        ResponseResult<Void> result = ResponseResult.fail(HttpServletResponse.SC_UNAUTHORIZED, "请登录");
        response.getWriter().write(objectMapper.writeValueAsString(result));
        return;
      }

      Claims claims = jwtUtil.parseToken(token);
      String username = claims.getSubject();
      UserDetails userDetails = userDetailsService.loadUserByUsername(username);
      UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
        userDetails,
        null,
        userDetails.getAuthorities()
      );
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (Exception e) {
        logger.error("用户登录失败: {}", e.getMessage());
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