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

import java.util.Date;
import java.util.Optional;


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
      int expiration = Long.valueOf(claims.getExpiration().getTime() - new Date().getTime()).intValue();

      userInfo.setToken(token);
      userRepository.updateTokenById(id, token);

      Cookie cookie = new Cookie("token", token);
      cookie.setMaxAge(expiration / 1000);
      cookie.setPath("/");
      cookie.setHttpOnly(true);

      response.addCookie(cookie);
      response.setHeader("Set-Cookie", String.format("token=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure", token, expiration / 1000));

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

      Cookie cookie = new Cookie("token", null);
      cookie.setMaxAge(0);
      cookie.setPath("/");
      cookie.setHttpOnly(true);
      response.addCookie(cookie);

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
