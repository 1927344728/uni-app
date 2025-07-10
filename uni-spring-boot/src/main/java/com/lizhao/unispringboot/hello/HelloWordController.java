package com.lizhao.unispringboot.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hello")
public class HelloWordController {
  @GetMapping("/helloWord")
  public String helloWord() {
    return "HelloWord!";
  }
}
