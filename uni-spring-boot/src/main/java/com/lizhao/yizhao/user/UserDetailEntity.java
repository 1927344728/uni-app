package com.lizhao.yizhao.user;

import jakarta.persistence.*;

@Entity
@Table(name = "user_detail")
public class UserDetailEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = true)
  private Byte gender; // 性别：1-男 2-女

  @Column(nullable = true)
  private Long birthday; // 生日时间戳

  @Column(nullable = true)
  private Byte education; // 学历：1-30。1-3幼儿园，4-9小学，10-12中学，13-15高中，16-20大学，21及以上研博

  @Column(name = "father_id", nullable = true)
  private Integer fatherId; // 父亲id

  @Column(name = "mother_id", nullable = true)
  private Integer motherId; // 母亲id

  @Column(name = "sibling_ids", nullable = true, columnDefinition = "TEXT")
  private String siblingIds; // 兄弟姐妹id

  @Column(name = "spouse_id", nullable = true)
  private Integer spouseId; // 配偶id

  @Column(name = "children_ids", nullable = true, columnDefinition = "TEXT")
  private String childrenIds; // 子女id

  @Column(name = "created_at", nullable = false)
  private Long createdAt; // 创建时间

  @Column(name = "updated_at", nullable = false)
  private Long updatedAt; // 更新时间

  @Column(name = "is_deleted", nullable = true)
  private Boolean isDeleted; // 删除标识

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Byte getGender() {
    return gender;
  }

  public void setGender(Byte gender) {
    this.gender = gender;
  }

  public Long getBirthday() {
    return birthday;
  }

  public void setBirthday(Long birthday) {
    this.birthday = birthday;
  }

  public Byte getEducation() {
    return education;
  }

  public void setEducation(Byte education) {
    this.education = education;
  }

  public Integer getFatherId() {
    return fatherId;
  }

  public void setFatherId(Integer fatherId) {
    this.fatherId = fatherId;
  }

  public Integer getMotherId() {
    return motherId;
  }

  public void setMotherId(Integer motherId) {
    this.motherId = motherId;
  }

  public String getSiblingIds() {
    return siblingIds;
  }

  public void setSiblingIds(String siblingIds) {
    this.siblingIds = siblingIds;
  }

  public Integer getSpouseId() {
    return spouseId;
  }

  public void setSpouseId(Integer spouseId) {
    this.spouseId = spouseId;
  }

  public String getChildrenIds() {
    return childrenIds;
  }

  public void setChildrenIds(String childrenIds) {
    this.childrenIds = childrenIds;
  }

  public Long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Long createdAt) {
    this.createdAt = createdAt;
  }

  public Long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Long updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Boolean getIsDeleted() {
    return isDeleted;
  }

  public void setIsDeleted(Boolean isDeleted) {
    this.isDeleted = isDeleted;
  }
}