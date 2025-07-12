package com.lizhao.yizhao.user;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "user_info")
public class UserInfoEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 36)
  private String uuid;

  @Column(name = "phone", nullable = false, unique = true, length = 11)
  private String phone;

  @Column(name = "name", nullable = true, length = 255)
  private String name;

  @Column(name = "user_name", nullable = true, length = 255)
  private String userName;

  @Column(name = "nickname", nullable = false, length = 255)
  private String nickname;

  @Column(name = "role", nullable = false)
  private Integer role;

  @Column(name = "captcha", nullable = true, length = 6)
  private String captcha;

  @Column(name = "password", nullable = true, length = 36)
  private String password;

  @Column(nullable = true, length = 255)
  private String token;

  public UserInfoEntity() {}

  @Column(name = "created_at", nullable = false, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Timestamp createdAt;

  @Column(name = "updated_at", nullable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Timestamp updatedAt;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  @Column(nullable = true, length = 255)
  private String email;

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }

  public String getUuid() {
    return uuid;
  }
  public void setUuid(String uuid) {
    this.uuid = uuid;
  }

  public String getPhone() {
    return phone;
  }
  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }

  public String getUserName() {
    return userName;
  }
  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getNickname() {
    return nickname;
  }
  public void setNickname(String nickname) {
    this.nickname = nickname;
  }

  public Integer getRole() {
    return role;
  }
  public void setRole(Integer role) {
    this.role = role;
  }

  public String getPassword () {
    return password;
  }
  public void setPassword(String password) {
    this.password = password;
  }

  public String getCaptcha() {
    return captcha;
  }

  public void setCaptcha(String captcha) {
    this.captcha = captcha;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public Timestamp getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Timestamp createdAt) {
    this.createdAt = createdAt;
  }

  public Timestamp getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Timestamp updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }

  public void setIsDeleted(Boolean isDeleted) {
    this.isDeleted = isDeleted;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}