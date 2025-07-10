package com.lizhao.unispringboot.user;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class UserEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 36)
  private String uuid;

  @Column(name = "phone", nullable = false, unique = true, length = 11)
  private String phone;

  @Column(nullable = true, length = 255)
  private String name;

  @Column(name = "user_type", nullable = false)
  private Integer userType;

  @Column(name = "captcha", nullable = true, length = 4)
  private String captcha;

  @Column(nullable = true, length = 255)
  private String token;

  @Column(nullable = true, length = 255)
  private String email;

  @Column(nullable = true)
  private Byte gender; // 性别：1-男 2-女

  @Column(nullable = true)
  private Long birthday; // 生日时间戳

  @Column(nullable = true)
  private Byte education; // 学历：1-30

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

  public Integer getUserType() {
    return userType;
  }

  public void setUserType(Integer userType) {
    this.userType = userType;
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

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
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

  public UserEntity setInfo(UserInfoEntity userInfo) {
    this.id = userInfo.getId();
    this.uuid = userInfo.getUuid();
    this.phone = userInfo.getPhone();
    this.name = userInfo.getName();
    this.userType = userInfo.getUserType();
    this.captcha = userInfo.getCaptcha();
    this.token = userInfo.getToken();
    this.email = userInfo.getEmail();
    return this;
  }

  public UserEntity setDetail(UserDetailEntity userDetail) {
    this.id = userDetail.getId();
    this.gender = userDetail.getGender();
    this.birthday = userDetail.getBirthday();
    this.education = userDetail.getEducation();
    this.fatherId = userDetail.getFatherId();
    this.motherId = userDetail.getMotherId();
    this.siblingIds = userDetail.getSiblingIds();
    this.spouseId = userDetail.getSpouseId();
    this.childrenIds = userDetail.getChildrenIds();
    return this;
  }
}
