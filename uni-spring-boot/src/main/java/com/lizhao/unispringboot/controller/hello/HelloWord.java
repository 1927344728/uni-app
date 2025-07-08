package com.lizhao.unispringboot.controller.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloWord {
  @GetMapping("/helloWord")
  public String helloWord() {
    return "HelloWord!";
  }
}
