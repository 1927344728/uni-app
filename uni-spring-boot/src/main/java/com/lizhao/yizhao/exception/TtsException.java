package com.lizhao.yizhao.exception;

public class TtsException extends RuntimeException {
  public TtsException(String message) {
    super(message);
  }

  public TtsException(String message, Throwable cause) {
    super(message, cause);
  }
}
