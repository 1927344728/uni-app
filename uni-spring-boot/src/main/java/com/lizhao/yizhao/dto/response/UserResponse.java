package com.lizhao.yizhao.dto.response;

// 移除 jakarta.persistence 相关导入
// import jakarta.persistence.*;

import com.lizhao.yizhao.entity.UserEntity;

import java.time.LocalDateTime;

public class UserResponse {
  public Long id;
  public String uuid;
  public String phone;
  public String name;
  private Integer sex;
  private LocalDateTime birthday;
  public String alias;
  public String nickname;
  public Integer role;
  public String email;

  public void setUser(UserEntity userInfo) {
    this.id = userInfo.getId();
    this.uuid = userInfo.getUuid();
    this.phone = userInfo.getPhone();
    this.name = userInfo.getName();
    this.sex = userInfo.getSex();
    this.birthday = userInfo.getBirthday();
    this.alias  = userInfo.getAlias();
    this.nickname = userInfo.getNickname();
    this.role = userInfo.getRole();
    this.email = userInfo.getEmail();
  }

  public <T> void updateField(String fieldName, T value) {
    try {
      java.lang.reflect.Field field = this.getClass().getField(fieldName);
      field.set(this, value);
    } catch (NoSuchFieldException | IllegalAccessException e) {
      e.printStackTrace();
    }
  }
}
