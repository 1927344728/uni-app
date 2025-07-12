package com.lizhao.unispringboot.service;

import com.lizhao.unispringboot.common.ResponseResult;
import com.lizhao.unispringboot.common.User;
import com.lizhao.unispringboot.user.*;
import com.lizhao.unispringboot.user.UserInfoRepository;
import com.lizhao.unispringboot.user.UserDetailRepository;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@Service
public class UserService {

  private final UserInfoRepository userInfoRepository;
  private final UserDetailRepository detailRepository;

  public UserService(UserInfoRepository userInfoRepository, UserDetailRepository detailRepository) {
    this.userInfoRepository = userInfoRepository;
    this.detailRepository = detailRepository;
  }

  public ResponseResult<User> getUserByCookieToken(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("token".equals(cookie.getName())) {
          String token = cookie.getValue();
          Optional<UserInfoEntity> userInfo = userInfoRepository.findByToken(token);
          Optional<UserDetailEntity> userDetail = userInfo.flatMap(info -> detailRepository.findById(info.getId()));

          User user = new User();
          userInfo.ifPresent(user::setUser);
          userDetail.ifPresent(user::setUser);

          return ResponseResult.success(user);
        }
      }
    }
    return ResponseResult.fail(401, "请登录");
  }
}