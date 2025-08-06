package com.lizhao.yizhao.common;

public class ResponseResult<T> {
  private int code;
  private T data;
  private boolean success;
  private String message;

  // 私有构造方法
  private ResponseResult(int code, T data, boolean success, String message) {
    this.code = code;
    this.data = data;
    this.success = success;
    this.message = message;
  }

  public static <T> ResponseResult<T> success(T data) {
    return new ResponseResult<>(200, data, true, "请求成功");
  }
  public static <T> ResponseResult<T> fail(int code, String message) {
    return new ResponseResult<>(code, null, false, message);
  }

  public int getCode() {
    return code;
  }

  public T getData() {
    return data;
  }

  public boolean isSuccess() {
    return success;
  }

  public String getMessage() {
    return message;
  }
}