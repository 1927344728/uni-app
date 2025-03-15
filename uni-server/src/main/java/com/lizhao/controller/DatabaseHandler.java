package com.lizhao.controller;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DatabaseHandler implements HttpHandler {
  private static final String DB_URL = "jdbc:mysql://localhost:3306/java_ai?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
  private static final String USER = "lizhao";
  private static final String PASS = "lizh1234";

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    List<Map<String, Object>> jsonList = new ArrayList<>();
    try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS);
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM phone_statistics WHERE manufacturer='Xiaomi'")) {

      while (rs.next()) {
        Map<String, Object> jsonObject = new HashMap<>();
        jsonObject.put("model", rs.getString("model"));
        jsonObject.put("manufacturer", rs.getString("manufacturer"));
        jsonObject.put("releaseDate", rs.getString("releaseDate"));
        jsonObject.put("userCount", rs.getInt("userCount"));
        jsonObject.put("merchant", rs.getString("merchant"));
        jsonList.add(jsonObject);
      }
    } catch (SQLException e) {
      Map<String, Object> errorObject = new HashMap<>();
      errorObject.put("error", "Database error: " + e.getMessage());
      jsonList.add(errorObject);
    }

    String response = toJsonString(jsonList);
    byte[] responseBytes = response.getBytes("UTF-8");
    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    exchange.sendResponseHeaders(200, responseBytes.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(responseBytes);
    }
  }

  private String toJsonString(List<Map<String, Object>> jsonList) {
    StringBuilder jsonString = new StringBuilder("[");
    for (int i = 0; i < jsonList.size(); i++) {
      jsonString.append(mapToJson(jsonList.get(i)));
      if (i < jsonList.size() - 1) {
        jsonString.append(",");
      }
    }
    jsonString.append("]");
    return jsonString.toString();
  }

  private String mapToJson(Map<String, Object> map) {
    StringBuilder json = new StringBuilder("{");
    for (Map.Entry<String, Object> entry : map.entrySet()) {
      json.append("\"").append(entry.getKey()).append("\":");
      if (entry.getValue() instanceof String) {
        json.append("\"").append(entry.getValue()).append("\"");
      } else {
        json.append(entry.getValue());
      }
      json.append(",");
    }
    json.deleteCharAt(json.length() - 1); // Remove trailing comma
    json.append("}");
    return json.toString();
  }
}
