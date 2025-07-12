package com.lizhao.yizhao.common;

import com.lizhao.yizhao.user.UserDetailEntity;
import com.lizhao.yizhao.user.UserInfoEntity;

// 移除 jakarta.persistence 相关导入
// import jakarta.persistence.*;

public class User {
  public Long id;
  public String uuid;
  public String phone;
  public String name;
  public Integer role;
  public String email;
  public Byte gender; // 性别：1-男 2-女
  public Long birthday; // 生日时间戳
  public Byte education; // 学历：1-30
  public Integer fatherId; // 父亲id
  public Integer motherId; // 母亲id
  public String siblingIds; // 兄弟姐妹id
  public Integer spouseId; // 配偶id
  public String childrenIds; // 子女id

  public void setUser(UserInfoEntity userInfo) {
    this.id = userInfo.getId();
    this.uuid = userInfo.getUuid();
    this.phone = userInfo.getPhone();
    this.name = userInfo.getName();
    this.role = userInfo.getRole();
    this.email = userInfo.getEmail();
  }

  public void setUser(UserDetailEntity userDetail) {
    this.id = userDetail.getId();
    this.gender = userDetail.getGender();
    this.birthday = userDetail.getBirthday();
    this.education = userDetail.getEducation();
    this.fatherId = userDetail.getFatherId();
    this.motherId = userDetail.getMotherId();
    this.siblingIds = userDetail.getSiblingIds();
    this.spouseId = userDetail.getSpouseId();
    this.childrenIds = userDetail.getChildrenIds();
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
