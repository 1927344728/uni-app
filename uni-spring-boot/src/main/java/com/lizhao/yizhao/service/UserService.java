package com.lizhao.yizhao.service;

import com.lizhao.yizhao.common.ResponseResult;
import com.lizhao.yizhao.common.User;
import com.lizhao.yizhao.user.*;
import com.lizhao.yizhao.user.UserDetailEntity;
import com.lizhao.yizhao.user.UserInfoEntity;
import com.lizhao.yizhao.user.UserInfoRepository;
import com.lizhao.yizhao.user.UserDetailRepository;
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