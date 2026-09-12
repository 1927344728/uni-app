package com.lizhao.yizhao.config.authority;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.util.JwtUtil;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lizhao.yizhao.entity.ApiCallStatEntity;
import com.lizhao.yizhao.entity.AdminPermissionEntity;
import com.lizhao.yizhao.entity.UserEntity;
import com.lizhao.yizhao.repository.ApiCallStatRepository;
import com.lizhao.yizhao.repository.AdminPermissionRepository;
import com.lizhao.yizhao.repository.UserRepository;

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
  private UserRepository userRepository;

  @Autowired
  private AdminPermissionRepository adminPermissionRepository;

  @Autowired
  private ApiCallStatRepository apiCallStatRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    try {
      // 检查请求是否有有效 token
      String token = parseJwt(request);
      recordApiCall(request, token);
      boolean isPublicPath = securityConfig.isPublicPath(request.getServletPath());
      boolean isAdminPath = request.getServletPath().startsWith("/api/admin/");
      boolean isValidToken = token != null && (isAdminPath ? jwtUtil.validateAdminToken(token) : jwtUtil.validateToken(token));
      if (!isPublicPath && !isValidToken) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        CommonResponse<Void> result = CommonResponse.fail(HttpServletResponse.SC_UNAUTHORIZED, "请登录");
        response.getWriter().write(objectMapper.writeValueAsString(result));
        return;
      }

      if (isPublicPath && token == null) {
        filterChain.doFilter(request, response);
        return;
      }

      Claims claims = jwtUtil.parseToken(token);
      String username = claims.getSubject();
      if (isAdminPath) {
        Optional<UserEntity> admin = userRepository.findByPhone(username);
        boolean isAdmin = admin.isPresent()
            && Boolean.FALSE.equals(admin.get().getIsDeleted())
            && isAdminRole(admin.get());
        if (!isAdmin) {
          response.setStatus(HttpServletResponse.SC_FORBIDDEN);
          response.setContentType("application/json;charset=UTF-8");
          CommonResponse<Void> result = CommonResponse.fail(HttpServletResponse.SC_FORBIDDEN, "无后台权限");
          response.getWriter().write(objectMapper.writeValueAsString(result));
          return;
        }
        if (!isSuperAdmin(admin.get()) && !hasAdminPermission(request, admin.get())) {
          response.setStatus(HttpServletResponse.SC_FORBIDDEN);
          response.setContentType("application/json;charset=UTF-8");
          CommonResponse<Void> result = CommonResponse.fail(HttpServletResponse.SC_FORBIDDEN, "无操作权限");
          response.getWriter().write(objectMapper.writeValueAsString(result));
          return;
        }
      }
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
    String authorization = request.getHeader("Authorization");
    if (authorization != null && authorization.startsWith("Bearer ")) {
      return authorization.substring(7);
    }
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

  private boolean hasAdminPermission(HttpServletRequest request, UserEntity user) {
    String servletPath = request.getServletPath();
    if (servletPath.equals("/api/admin/me") || servletPath.equals("/api/admin/logout")) return true;
    String page = pagePermission(servletPath);
    if (page == null) return false;

    Optional<AdminPermissionEntity> permission = adminPermissionRepository.findByUserId(user.getId());
    if (permission.isEmpty()) return false;

    List<String> pages = readList(permission.get().getPagePermissions());
    if (!pages.contains(page)) return false;
    if ("GET".equalsIgnoreCase(request.getMethod())) return true;

    String button = buttonPermission(page, servletPath, request.getMethod());
    return button != null && readList(permission.get().getButtonPermissions()).contains(button);
  }

  private String pagePermission(String path) {
    if (path.equals("/api/admin/stats/api-calls")) return "dashboard";
    if (path.matches("^/api/admin/users/\\d+/permissions$")) return "system.permissions";
    if (path.startsWith("/api/admin/users")) return "system.users";
    Map<String, String> resources = Map.ofEntries(
        Map.entry("articles", "content.articles"),
        Map.entry("books", "content.books"),
        Map.entry("musics", "content.musics"),
        Map.entry("music-menus", "content.musicMenus"),
        Map.entry("videos", "content.videos"),
        Map.entry("video-menus", "content.videoMenus"),
        Map.entry("tasks", "content.tasks"),
        Map.entry("banners", "ops.banners"),
        Map.entry("home-entries", "ops.homeEntries"),
        Map.entry("categories", "ops.categories"),
        Map.entry("word-libraries", "ops.wordLibraries")
    );
    String suffix = path.substring("/api/admin/".length());
    String resource = suffix.split("/")[0];
    return resources.get(resource);
  }

  private String buttonPermission(String page, String path, String method) {
    if ("POST".equalsIgnoreCase(method)) return page + ".create";
    if ("DELETE".equalsIgnoreCase(method)) return page + ".delete";
    if ("PUT".equalsIgnoreCase(method)) {
      if (path.endsWith("/password")) return page + ".resetPassword";
      if (path.endsWith("/role")) return page + ".changeRole";
      if (path.endsWith("/permissions")) return page + ".edit";
      return page + ".edit";
    }
    return null;
  }

  private boolean isAdminRole(UserEntity user) {
    Integer adminRole = user.getAdminRole();
    return adminRole != null && (adminRole == 1 || adminRole == 2);
  }

  private boolean isSuperAdmin(UserEntity user) {
    return user.getAdminRole() != null && user.getAdminRole() == 1;
  }

  private List<String> readList(String json) {
    if (json == null || json.isBlank()) return List.of();
    try {
      return objectMapper.readValue(json, new TypeReference<List<String>>() {});
    } catch (Exception e) {
      return List.of();
    }
  }

  private synchronized void recordApiCall(HttpServletRequest request, String token) {
    String path = request.getServletPath();
    if (!path.startsWith("/api/") || "OPTIONS".equalsIgnoreCase(request.getMethod())) return;
    try {
      Optional<UserEntity> user = Optional.empty();
      if (token != null && jwtUtil.validateToken(token)) {
        Claims claims = jwtUtil.parseToken(token);
        user = userRepository.findByPhone(claims.getSubject());
      }

      ApiCallStatEntity stat;
      if (user.isPresent()) {
        UserEntity currentUser = user.get();
        stat = apiCallStatRepository.findByUserIdAndPath(currentUser.getId(), path)
            .orElseGet(() -> newUserStat(currentUser, path));
      } else {
        stat = apiCallStatRepository.findByUserIdIsNullAndPath(path)
            .orElseGet(() -> newAnonymousStat(path));
      }

      user.ifPresent(value -> {
        stat.setUserId(value.getId());
        stat.setUserName(value.getName());
        stat.setPhone(value.getPhone());
      });
      stat.setPath(path);
      stat.setCount((stat.getCount() == null ? 0L : stat.getCount()) + 1L);
      apiCallStatRepository.save(stat);
    } catch (Exception e) {
      logger.warn("接口调用统计失败: {}", e.getMessage());
    }
  }

  private ApiCallStatEntity newUserStat(UserEntity user, String path) {
    ApiCallStatEntity stat = new ApiCallStatEntity();
    stat.setUserId(user.getId());
    stat.setUserName(user.getName());
    stat.setPhone(user.getPhone());
    stat.setPath(path);
    stat.setCount(0L);
    return stat;
  }

  private ApiCallStatEntity newAnonymousStat(String path) {
    ApiCallStatEntity stat = new ApiCallStatEntity();
    stat.setPath(path);
    stat.setCount(0L);
    return stat;
  }
}