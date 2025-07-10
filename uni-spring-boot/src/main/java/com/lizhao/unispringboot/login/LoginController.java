package com.lizhao.unispringboot.login;

import com.lizhao.unispringboot.user.UserInfoEntity;
import com.lizhao.unispringboot.user.UserInfoRepository;
import com.lizhao.unispringboot.authority.JwtUtil;
import io.jsonwebtoken.Claims;
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

  public LoginController(UserInfoRepository userInfoRepository) {
    this.userInfoRepository = userInfoRepository;
  }

  @GetMapping("/login")
  public ResponseEntity<?> login(@RequestParam String phone, @RequestParam String password, HttpServletResponse response) {
    try {
      UserInfoEntity userInfo = userInfoRepository.findByPhone(phone).get();

      if (userInfo == null) {
        return ResponseEntity
          .status(HttpStatus.NOT_FOUND)
          .body("手机号或密码错误!");
      }
      if (!userInfo.getPassword().equals(password)) {
        return ResponseEntity
          .status(HttpStatus.UNAUTHORIZED)
          .body("手机号或密码错误!");
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

      return ResponseEntity.ok().body("登录成功");
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("服务器错误!");
    }
  }
}
