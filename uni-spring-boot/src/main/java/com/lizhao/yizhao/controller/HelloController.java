package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hello")
public class HelloController {
  @GetMapping("/helloWord")
  public CommonResponse<String> helloWord() {
    return CommonResponse.success("Hello, World!");
  }

  @GetMapping("/welcome")
  public CommonResponse<String> welcome() {
    return CommonResponse.success("welcome!");
  }
}
