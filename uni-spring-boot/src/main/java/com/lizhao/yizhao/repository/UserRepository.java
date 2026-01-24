package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
  Optional<UserEntity> findByToken(String token);
  Optional<UserEntity> findByUuid(String uuid);
  Optional<UserEntity> findByName(String name);
  Optional<UserEntity> findByPhone(String phone);

  @Modifying
  @Transactional
  @Query("UPDATE UserEntity u SET u.token = :token WHERE u.id = :id")
  void updateTokenById(@Param("id") Long id, @Param("token") String token);

  @Modifying
  @Transactional
  @Query("UPDATE UserEntity u SET u.password = :password WHERE u.id = :id")
  void updatePasswordById(@Param("id") Long id, @Param("password") String password);
}