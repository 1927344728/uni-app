package com.lizhao.yizhao.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "api_call_stat", uniqueConstraints = {
    @UniqueConstraint(name = "uk_api_call_stat_user_path", columnNames = {"user_id", "path"})
}, indexes = {
    @Index(name = "idx_api_call_stat_user_id", columnList = "user_id"),
    @Index(name = "idx_api_call_stat_path", columnList = "path")
})
public class ApiCallStatEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id")
  private Long userId;

  @Column(name = "user_name", length = 255)
  private String userName;

  @Column(length = 11)
  private String phone;

  @Column(nullable = false, length = 255)
  private String path;

  @Column(nullable = false)
  private Long count;

  @Column(name = "created_time", nullable = false, updatable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = false)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant updatedTime;

  @PrePersist
  public void prePersist() {
    Instant now = Instant.now();
    createdTime = now;
    updatedTime = now;
    if (count == null) count = 0L;
  }

  @PreUpdate
  public void preUpdate() {
    updatedTime = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }
}
