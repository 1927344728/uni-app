package com.lizhao.yizhao.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_permission", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
public class AdminPermissionEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "page_permissions", columnDefinition = "TEXT")
  private String pagePermissions;

  @Column(name = "button_permissions", columnDefinition = "TEXT")
  private String buttonPermissions;

  @Column(name = "created_time", nullable = false, updatable = false)
  private Instant createdTime;

  @Column(name = "updated_time", nullable = false)
  private Instant updatedTime;

  @PrePersist
  public void prePersist() {
    Instant now = Instant.now();
    createdTime = now;
    updatedTime = now;
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

  public String getPagePermissions() {
    return pagePermissions;
  }

  public void setPagePermissions(String pagePermissions) {
    this.pagePermissions = pagePermissions;
  }

  public String getButtonPermissions() {
    return buttonPermissions;
  }

  public void setButtonPermissions(String buttonPermissions) {
    this.buttonPermissions = buttonPermissions;
  }
}
