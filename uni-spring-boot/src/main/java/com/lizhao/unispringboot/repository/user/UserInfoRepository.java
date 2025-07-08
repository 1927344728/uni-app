package com.lizhao.unispringboot.repository.user;

import com.lizhao.unispringboot.entity.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
  Optional<UserInfo> findByPhoneNumber(String phoneNumber);
}