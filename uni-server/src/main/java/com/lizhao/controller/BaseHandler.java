package com.lizhao.controller;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public abstract class BaseHandler implements HttpHandler {
  @Override
  public void handle(HttpExchange exchange) throws IOException {
    setCorsHeaders(exchange);
    try {
        String message = getResponse();
        String response = createJsonResponse(200, true, "Success", message);
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
          os.write(responseBytes);
        }
    } catch (Exception e) {
      String errorResponse = createJsonResponse(500, false, e.getMessage(), null);
      byte[] errorBytes = errorResponse.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
      exchange.sendResponseHeaders(500, errorBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(errorBytes);
      }
    }
  }

  protected abstract String getResponse();
  private void setCorsHeaders(HttpExchange exchange) {
    String requestHost = exchange.getRequestHeaders().getFirst("origin");
    // 如果origin为空，使用通配符
    requestHost = (requestHost != null) ? requestHost : "*";
    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", requestHost);
    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization,x-requested-with");
    exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
  }

  private String createJsonResponse(int code, boolean success, String info, Object data) {
    return String.format(
      "{\"code\":%d,\"success\":%b,\"info\":\"%s\",\"data\":\"%s\"}",
      code, success, info, data != null ? data.toString() : "null"
    );
  }
} 