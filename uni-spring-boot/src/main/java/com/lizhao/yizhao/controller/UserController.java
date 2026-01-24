package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.dto.response.UserResponse;
import com.lizhao.yizhao.entity.UserEntity;
import com.lizhao.yizhao.repository.UserRepository;
import com.lizhao.yizhao.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

  private final UserRepository userRepository;
  private final UserService userService;

  public UserController(UserRepository userRepository, UserService userService) {
    this.userRepository = userRepository;
    this.userService = userService;
  }

  @GetMapping("/getUserInfo")
  @ResponseBody
  public CommonResponse<UserResponse> getUserInfo(HttpServletRequest request) {
    return userService.getUserByCookieToken(request);
  }

  @GetMapping("/findUserByUuid")
  @ResponseBody
  public CommonResponse<UserResponse> user(@RequestParam String uuid) {
    Optional<UserEntity> user = userRepository.findByUuid(uuid);
    UserResponse userResponse = new UserResponse();
    user.ifPresent(userResponse::setUser);
    return CommonResponse.success(userResponse);
  }
}