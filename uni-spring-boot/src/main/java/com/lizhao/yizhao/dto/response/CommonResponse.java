package com.lizhao.yizhao.dto.response;

public class CommonResponse<T> {
  private int code;
  private T data;
  private boolean success;
  private String message;

  // 私有构造方法
  private CommonResponse(int code, T data, boolean success, String message) {
    this.code = code;
    this.data = data;
    this.success = success;
    this.message = message;
  }

  public static <T> CommonResponse<T> success(T data) {
    return new CommonResponse<>(200, data, true, "请求成功");
  }
  public static <T> CommonResponse<T> fail(int code, String message) {
    return new CommonResponse<>(code, null, false, message);
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