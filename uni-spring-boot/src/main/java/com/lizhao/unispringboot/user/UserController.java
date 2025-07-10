package com.lizhao.unispringboot.user;

import jakarta.persistence.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user")
public class UserController {

  private final UserInfoRepository userInfoRepository;
  private final UserDetailRepository detailRepository;

  public UserController(UserInfoRepository userInfoRepository, UserDetailRepository detailRepository) {
    this.userInfoRepository = userInfoRepository;
    this.detailRepository = detailRepository;
  }

  @GetMapping("/getList")
  public List<UserInfoEntity> list() {
    return userInfoRepository.findAll();
  }

  @GetMapping("/findUserById")
  @ResponseBody
  public UserEntity user(@RequestParam Long id) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findById(id);
    Optional<UserDetailEntity> userDetail = detailRepository.findById(id);

    UserEntity user = new UserEntity();
    userInfo.ifPresent(user::setInfo);
    userDetail.ifPresent(user::setDetail);

    return user;
  }

  @GetMapping("/findUserInfoById")
  @ResponseBody
  public UserInfoEntity getUserInfo(@RequestParam Long id) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findById(id);
    return userInfo.orElse(null);
  }

  @GetMapping("/findUserDetailById")
  @ResponseBody
  public UserDetailEntity getUserDetail(@RequestParam Long id) {
    Optional<UserDetailEntity> userDetail = detailRepository.findById(id);
    return userDetail.orElse(null);
  }
}