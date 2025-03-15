package com.lizhao;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Main3 {
  private static final int PORT = 8088;

  public static void main(String[] args) throws IOException {
    HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

    server.createContext("/", (HttpExchange exchange) -> {
      String response = "Hello, Lizhao!";
      byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
      exchange.sendResponseHeaders(200, responseBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(responseBytes);
      }
    });

    server.setExecutor(null);
    server.start();

    System.out.println("Server started on port " + PORT);
  }
}