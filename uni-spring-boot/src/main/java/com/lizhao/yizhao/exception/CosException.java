package com.lizhao.yizhao.exception;

public class CosException extends RuntimeException {
  public CosException(String message) {
    super(message);
  }

  public CosException(String message, Throwable cause) {
    super(message, cause);
  }
}
