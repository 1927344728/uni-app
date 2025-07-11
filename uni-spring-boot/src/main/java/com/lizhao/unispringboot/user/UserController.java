package com.lizhao.unispringboot.user;

import com.lizhao.unispringboot.common.ResponseResult;
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
  public ResponseResult<List<UserInfoEntity>> list() {
    List<UserInfoEntity> userList = userInfoRepository.findAll();
    return ResponseResult.success(userList);
  }

  @GetMapping("/findUserById")
  @ResponseBody
  public ResponseResult<UserEntity> user(@RequestParam Long id) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findById(id);
    Optional<UserDetailEntity> userDetail = detailRepository.findById(id);

    UserEntity user = new UserEntity();
    userInfo.ifPresent(user::setInfo);
    userDetail.ifPresent(user::setDetail);

    return ResponseResult.success(user);
  }

  @GetMapping("/findUserInfoById")
  @ResponseBody
  public ResponseResult<UserInfoEntity> getUserInfo(@RequestParam Long id) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findById(id);
    return ResponseResult.success(userInfo.orElse(null));
  }

  @GetMapping("/findUserDetailById")
  @ResponseBody
  public ResponseResult<UserDetailEntity> getUserDetail(@RequestParam Long id) {
    Optional<UserDetailEntity> userDetail = detailRepository.findById(id);
    return ResponseResult.success(userDetail.orElse(null));
  }
}