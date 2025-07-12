package com.lizhao.yizhao.exception;

import com.lizhao.yizhao.common.ResponseResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(NoHandlerFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ResponseResult <String> handleNotFoundException(NoHandlerFoundException e) {
    logger.error("路径不存在", e);
    return ResponseResult.fail(404, "路径不存在，请检查路径是否正确");
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
  public ResponseResult <String>  handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
    logger.error("请求方法错误", e);
    return ResponseResult.fail(405, "不支持" + e.getMethod() + "请求方法");
  }

  @ExceptionHandler(MissingServletRequestParameterException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseResult <Void> handleMethodArgumentNotValidException(MissingServletRequestParameterException e) {
    logger.error("请求参数错误", e);
    return ResponseResult.fail(400, "参数错误");
  }

  @ExceptionHandler(AsyncRequestTimeoutException.class)
  @ResponseStatus(HttpStatus.REQUEST_TIMEOUT)
  public ResponseResult <Void> handleAsyncRequestTimeoutException(AsyncRequestTimeoutException e) {
    logger.error("请求超时", e);
    return ResponseResult.fail(408, "请求超时");
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ResponseResult <Void> handleException(Exception e) {
    logger.error("系统错误", e);
    return ResponseResult.fail(500, "系统错误");
  }
}