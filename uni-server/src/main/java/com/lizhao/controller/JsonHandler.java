package com.lizhao.controller;

import java.util.HashMap;
import java.util.Map;

public class JsonHandler extends BaseHandler {
  @Override
  protected String getResponse() {
    Map<String, Object> data = new HashMap<>();
    data.put("message", "Hello from JSON API");
    data.put("status", "success");
    data.put("timestamp", System.currentTimeMillis());
    
    // 手动构建 JSON 字符串
    StringBuilder json = new StringBuilder();
    json.append("{");
    boolean first = true;
    for (Map.Entry<String, Object> entry : data.entrySet()) {
      if (!first) {
        json.append(",");
      }
      json.append("\"").append(entry.getKey()).append("\":");
      if (entry.getValue() instanceof String) {
        json.append("\"").append(entry.getValue()).append("\"");
      } else {
        json.append(entry.getValue());
      }
      first = false;
    }
    json.append("}");
    
    return json.toString();
  }
} 