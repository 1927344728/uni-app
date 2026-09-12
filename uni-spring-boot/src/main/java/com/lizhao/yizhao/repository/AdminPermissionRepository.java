package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.AdminPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminPermissionRepository extends JpaRepository<AdminPermissionEntity, Long> {
  Optional<AdminPermissionEntity> findByUserId(Long userId);
}
