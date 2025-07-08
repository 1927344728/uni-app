package com.lizhao.unispringboot.controller.user;

import com.lizhao.unispringboot.entity.user.UserInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
public class LoginController {

  @Autowired
  private UserController userController;

  @GetMapping("/login")
  public ResponseEntity<?> login(@RequestParam String phone, @RequestParam String password) {
    try {
      UserInfo userInfo = userController.getUserInfoByPhoneNumber(phone);

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

      return ResponseEntity.ok(userInfo);
    } catch (Exception e) {
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
