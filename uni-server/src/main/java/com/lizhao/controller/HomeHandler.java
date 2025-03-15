package com.lizhao.controller;

public class HomeHandler extends BaseHandler {
  @Override
  protected String getResponse() {
    return "欢迎访问 Java HTTP 服务器！";
  }
} 