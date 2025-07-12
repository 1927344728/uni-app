package com.lizhao.yizhao.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfoEntity, Long> {
  Optional<UserInfoEntity> findByToken(String token);
  Optional<UserInfoEntity> findByUuid(String uuid);
  Optional<UserInfoEntity> findByUserName(String userName);
  Optional<UserInfoEntity> findByPhone(String phone);

  @Modifying
  @Transactional
  @Query("UPDATE UserInfoEntity u SET u.token = :token WHERE u.id = :id")
  void updateTokenById(@Param("id") Long id, @Param("token") String token);
}