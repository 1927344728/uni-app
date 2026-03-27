package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.dto.response.UserResponse;
import com.lizhao.yizhao.entity.UserEntity;
import com.lizhao.yizhao.repository.UserRepository;
import com.lizhao.yizhao.service.UserService;
import com.lizhao.yizhao.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;


@RestController
@RequestMapping("/api")
public class LoginController {
  private final UserRepository userRepository;
  private final UserService userService;

  public LoginController(UserRepository userRepository, UserService userService) {
    this.userRepository = userRepository;
    this.userService = userService;
  }

  @GetMapping("/login")
  public CommonResponse<String> login(@RequestParam String phone, @RequestParam String password, HttpServletResponse response) {
    try {
      UserEntity userInfo = userRepository.findByPhone(phone).or(() -> userRepository.findByName(phone)).get();

      if (!userInfo.getPassword().equals(password)) {
        return CommonResponse.fail(HttpStatus.FORBIDDEN.value(), "手机号或密码错误!");
      }

      JwtUtil jwtUtil = new JwtUtil();
      Long id = userInfo.getId();
      String token = jwtUtil.generateToken(phone);
      Claims claims = jwtUtil.parseToken(token);
      // 剩余毫秒数可能超过 Integer.MAX_VALUE（如 30 天），不能用 int 存，否则溢出成负的 Max-Age
      long remainingMs = claims.getExpiration().getTime() - System.currentTimeMillis();
      int maxAgeSeconds = (int) Math.max(0L, remainingMs / 1000);

      userInfo.setToken(token);
      userRepository.updateTokenById(id, token);

      ResponseCookie tokenCookie = ResponseCookie.from("token", token)
          .maxAge(maxAgeSeconds)
          .path("/")
          .httpOnly(true)
          .secure(true)
          .sameSite("None")
          .build();
      response.addHeader(HttpHeaders.SET_COOKIE, tokenCookie.toString());

      return CommonResponse.success("登录成功");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }

  @GetMapping("/logout")
  public CommonResponse<String> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
      CommonResponse<UserResponse> userInfo = userService.getUserByCookieToken(request);
      Long id = userInfo.getData().id;
      userRepository.updateTokenById(id, null);

      ResponseCookie cleared = ResponseCookie.from("token", "")
          .maxAge(0)
          .path("/")
          .httpOnly(true)
          .secure(true)
          .sameSite("None")
          .build();
      response.addHeader(HttpHeaders.SET_COOKIE, cleared.toString());

      return CommonResponse.success("登出成功");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }

  @GetMapping("/updatePassword")
  public CommonResponse<String> updatePassword(@RequestParam String password, @RequestParam String newPassword, HttpServletRequest request) {
    try {
      Cookie[] cookies = request.getCookies();
      if (cookies != null) {
        for (Cookie cookie : cookies) {
          if ("token".equals(cookie.getName())) {
            String token = cookie.getValue();
            Optional<UserEntity> userInfo = userRepository.findByToken(token);
            String userPassword = userInfo.get().getPassword();
            Long id = userInfo.get().getId();
            if (!password.equals(userPassword)) {
              return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "原密码错误!");
            }
            userRepository.updatePasswordById(id, newPassword);
          }
        }
      }

      return CommonResponse.success("");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }
}
