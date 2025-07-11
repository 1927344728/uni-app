package com.lizhao.unispringboot.hello;

import com.lizhao.unispringboot.common.ResponseResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hello")
public class HelloWordController {
  @GetMapping("/helloWord")
  public ResponseResult <String> helloWord() {
    return ResponseResult.success("HelloWord!");
  }
}
