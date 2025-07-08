package com.lizhao.unispringboot.login;

import com.lizhao.unispringboot.user.UserDetailRepository;
import com.lizhao.unispringboot.user.UserInfoEntity;
import com.lizhao.unispringboot.user.UserController;
import com.lizhao.unispringboot.user.UserInfoRepository;
import com.lizhao.unispringboot.util.JwtUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Date;
import java.time.LocalDateTime;


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
      UserInfoEntity userInfo = userInfoRepository.findByPhoneNumber(phone).get();

      if (userInfo == null) {
        return ResponseEntity
          .status(HttpStatus.NOT_FOUND)
          .body("手机号或密码错误!");
      }
      if (!userInfo.getVerificationCode().equals(password)) {
        return ResponseEntity
          .status(HttpStatus.UNAUTHORIZED)
          .body("手机号或密码错误!");
      }

      Long id = userInfo.getId();
      String token = JwtUtil.generateToken(phone);
      LocalDateTime now = LocalDateTime.now();
      LocalDateTime expiry = now.plusDays(1);
      userInfo.setToken(token);
      userInfo.setTokenExpiry(expiry);
      userInfoRepository.updateTokenById(id, token);
      userInfoRepository.updateTokenExpiryById(id, expiry);

      Cookie cookie = new Cookie("token", token);
      cookie.setMaxAge(86400); // 24小时
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

  public static class LoginRequest {
    private String phone;
    private String password;

    public String getPhone() {
      return phone;
    }

    public void setPhone(String phone) {
      this.phone = phone;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }
}
