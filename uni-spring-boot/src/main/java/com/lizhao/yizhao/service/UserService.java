package com.lizhao.yizhao.service;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.dto.response.UserResponse;
import com.lizhao.yizhao.entity.UserEntity;
import com.lizhao.yizhao.repository.UserRepository;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userInfoRepository;

  public UserService(UserRepository userInfoRepository) {
    this.userInfoRepository = userInfoRepository;
  }

  public CommonResponse<UserResponse> getUserByCookieToken(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("token".equals(cookie.getName())) {
          String token = cookie.getValue();
          Optional<UserEntity> userInfo = userInfoRepository.findByToken(token);

          UserResponse user = new UserResponse();
          userInfo.ifPresent(user::setUser);

          return CommonResponse.success(user);
        }
      }
    }
    return CommonResponse.fail(401, "请登录");
  }
}