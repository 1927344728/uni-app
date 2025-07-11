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
  public ResponseResult<com.lizhao.unispringboot.common.User> user(@RequestParam Long id) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findById(id);
    Optional<UserDetailEntity> userDetail = detailRepository.findById(id);

    com.lizhao.unispringboot.common.User user = new com.lizhao.unispringboot.common.User();
    userInfo.ifPresent(user::setUser);
    userDetail.ifPresent(user::setUser);

    return ResponseResult.success(user);
  }

  @GetMapping("/findUserInfoByUuid")
  @ResponseBody
  public ResponseResult<UserInfoEntity> getUserInfo(@RequestParam String uuid) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findByUuid(uuid);
    return ResponseResult.success(userInfo.orElse(null));
  }

  @GetMapping("/findUserDetailByUuid")
  @ResponseBody
  public ResponseResult<UserDetailEntity> getUserDetail(@RequestParam String uuid) {
    Optional<UserInfoEntity> userInfo = userInfoRepository.findByUuid(uuid);
    Optional<UserDetailEntity> userDetail = userInfo.flatMap(info -> detailRepository.findById(info.getId()));
    return ResponseResult.success(userDetail.orElse(null));
  }
}