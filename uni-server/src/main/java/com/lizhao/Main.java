package com.lizhao;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import com.lizhao.controller.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
  private static final int PORT = 8088;
  private static final int THREAD_POOL_SIZE = 10;

  private static void setCorsHeaders(HttpExchange exchange) {
    String requestHost = exchange.getRequestHeaders().getFirst("origin");
    requestHost = (requestHost != null) ? requestHost : "*";
    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", requestHost);
    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization,x-requested-with");
    exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
  }

  private static String createJsonResponse(int code, boolean success, String info, Object data) {
    return String.format(
      "{\"code\":%d,\"success\":%b,\"info\":\"%s\",\"data\":\"%s\"}",
      code, success, info, data.toString()
    );
  }

  public static void main(String[] args) {
    try {
      HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
      
      server.createContext("/", new HomeHandler());
      server.createContext("/api/simple", (HttpExchange exchange) -> {
        String message = "Hello, Lizhao!";
        String jsonResponse = createJsonResponse(200, true, "Success", message);
        byte[] responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, responseBytes.length);
        
        try (OutputStream os = exchange.getResponseBody()) {
          os.write(responseBytes);
        }
        exchange.close();
      });
      server.createContext("/api", new ApiHandler());
      server.createContext("/api/json", new JsonHandler());
      server.createContext("/api/db", new DatabaseHandler());
      
      ExecutorService executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
      server.setExecutor(executor);

      server.start();
      System.out.println("服务器已启动，监听端口 " + PORT + "...");
      System.out.println("线程池大小：" + THREAD_POOL_SIZE);
      System.out.println("API 地址：http://localhost:" + PORT + "/api");
    } catch (Exception e) {
      System.err.println("服务器启动失败：" + e.getMessage());
      e.printStackTrace();
    }
  }
}