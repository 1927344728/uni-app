package com.lizhao.yizhao.login;

import com.lizhao.yizhao.common.ResponseResult;
import com.lizhao.yizhao.common.User;
import com.lizhao.yizhao.service.UserService;
import com.lizhao.yizhao.user.UserInfoEntity;
import com.lizhao.yizhao.user.UserInfoRepository;
import com.lizhao.yizhao.authority.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Date;


@RestController
@RequestMapping("/api")
public class LoginController {
  private final UserInfoRepository userInfoRepository;
  private final UserService userService;

  public LoginController(UserInfoRepository userInfoRepository, UserService userService) {
    this.userInfoRepository = userInfoRepository;
    this.userService = userService;
  }

  @GetMapping("/login")
  public ResponseResult<String> login(@RequestParam String phone, @RequestParam String password, HttpServletResponse response) {
    try {
      UserInfoEntity userInfo = userInfoRepository.findByPhone(phone).or(() -> userInfoRepository.findByUserName(phone)).get();

      if (!userInfo.getPassword().equals(password)) {
        return ResponseResult.fail(HttpStatus.FORBIDDEN.value(), "手机号或密码错误!");
      }

      JwtUtil jwtUtil = new JwtUtil();
      Long id = userInfo.getId();
      String token = jwtUtil.generateToken(phone);
      Claims claims = jwtUtil.parseToken(token);
      int expiration = Long.valueOf(claims.getExpiration().getTime() - new Date().getTime()).intValue();

      userInfo.setToken(token);
      userInfoRepository.updateTokenById(id, token);

      Cookie cookie = new Cookie("token", token);
      cookie.setMaxAge(expiration / 1000);
      cookie.setPath("/");
      cookie.setHttpOnly(true);

      response.addCookie(cookie);
      response.setHeader("Set-Cookie", String.format("token=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure", token, expiration / 1000));

      return ResponseResult.success("登录成功");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return ResponseResult.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }

  @GetMapping("/logout")
  public ResponseResult<String> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
      ResponseResult <User> userInfo = userService.getUserByCookieToken(request);
      Long id = userInfo.getData().id;
      userInfoRepository.updateTokenById(id, null);

      Cookie cookie = new Cookie("token", null);
      cookie.setMaxAge(0);
      cookie.setPath("/");
      cookie.setHttpOnly(true);
      response.addCookie(cookie);

      return ResponseResult.success("登出成功");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return ResponseResult.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }
}
