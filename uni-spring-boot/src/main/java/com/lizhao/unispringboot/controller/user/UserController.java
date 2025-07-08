package com.lizhao.unispringboot.controller.user;

import com.lizhao.unispringboot.entity.user.User;
import com.lizhao.unispringboot.entity.user.UserInfo;
import com.lizhao.unispringboot.entity.user.UserDetail;
import com.lizhao.unispringboot.repository.user.UserInfoRepository;
import com.lizhao.unispringboot.repository.user.UserDetailRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

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
  public List<UserInfo> list() {
    return userInfoRepository.findAll();
  }

  @GetMapping("/findUserById")
  @ResponseBody
  public User user(@RequestParam Long id) {
    Optional<UserInfo> userInfo = userInfoRepository.findById(id);
    Optional<UserDetail> userDetail = detailRepository.findById(id);

    User user = new User();
    userInfo.ifPresent(user::setInfo);
    userDetail.ifPresent(user::setDetail);

    return user;
  }

  @GetMapping("/findUserInfoById")
  @ResponseBody
  public UserInfo getUserInfo(@RequestParam Long id) {
    Optional<UserInfo> userInfo = userInfoRepository.findById(id);
    return userInfo.orElse(null);
  }

  @GetMapping("/findUserInfoByPhoneNumber")
  @ResponseBody
  public UserInfo getUserInfoByPhoneNumber(@RequestParam String phoneNumber) {
    System.out.print("Searching user info for phone number: {}");
    Optional<UserInfo> userInfo = userInfoRepository.findByPhoneNumber(phoneNumber);
    System.out.print("Found user info: {}");
    return userInfo.orElse(null);
  }

  @GetMapping("/findUserDetailById")
  @ResponseBody
  public UserDetail getUserDetail(@RequestParam Long id) {
    Optional<UserDetail> userDetail = detailRepository.findById(id);
    return userDetail.orElse(null);
  }
}