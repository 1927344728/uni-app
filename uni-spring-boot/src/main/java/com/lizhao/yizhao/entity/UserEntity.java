package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "user", uniqueConstraints = {
    @UniqueConstraint(columnNames = "uuid"),
    @UniqueConstraint(columnNames = "phone")
})
public class UserEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 36)
  private String uuid;

  @Column(nullable = false, unique = true, length = 11)
  private String phone;

  @Column(nullable = true, length = 255)
  private String name;

  @Column(nullable = true)
  private Integer sex;

  @Column(nullable = true)
  private LocalDateTime birthday;

  @Column(nullable = false, length = 255)
  private String alias;

  @Column(nullable = true, length = 255)
  private String nickname;

  @Column(nullable = true, length = 255)
  private String email;

  @Column(nullable = false)
  private Integer role;

  @Column(nullable = false, length = 36)
  private String password;

  @Column(nullable = true, length = 6)
  private String captcha;

  @Column(nullable = true, length = 255)
  private String token;

  @Column(name = "created_at", nullable = false, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private LocalDateTime updatedAt;

  @Column(name = "is_deleted", nullable = false)
  private Boolean isDeleted;

  public UserEntity() {}

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

  public Integer getSex() {
    return sex;
  }
  public void setSex(Integer sex) {
    this.sex = sex;
  }

  public LocalDateTime getBirthday() {
    return birthday;
  }
  public void setBirthday(LocalDateTime birthday) {
    this.birthday = birthday;
  }

  public String getAlias() {
    return alias;
  }
  public void setAlias(String alias) {
    this.alias = alias;
  }

  public String getNickname() {
    return nickname;
  }
  public void setNickname(String nickname) {
    this.nickname = nickname;
  }

  public String getEmail() {
    return email;
  }
  public void setEmail(String email) {
    this.email = email;
  }

  public Integer getRole() {
    return role;
  }
  public void setRole(Integer role) {
    this.role = role;
  }

  public String getPassword() {
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

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }
  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }
  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }
  public void setIsDeleted(Boolean isDeleted) {
    this.isDeleted = isDeleted;
  }
}