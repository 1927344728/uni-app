package com.lizhao.unispringboot.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.time.LocalDateTime;

public interface UserInfoRepository extends JpaRepository<UserInfoEntity, Long> {
  Optional<UserInfoEntity> findByPhoneNumber(String phoneNumber);
  
  @Modifying
  @Transactional
  @Query("UPDATE UserInfoEntity u SET u.token = :token WHERE u.id = :id")
  void updateTokenById(@Param("id") Long id, @Param("token") String token);
  
  @Modifying
  @Transactional
  @Query("UPDATE UserInfoEntity u SET u.tokenExpiry = :tokenExpiry WHERE u.id = :id")
  void updateTokenExpiryById(@Param("id") Long id, @Param("tokenExpiry") LocalDateTime tokenExpiry);
}