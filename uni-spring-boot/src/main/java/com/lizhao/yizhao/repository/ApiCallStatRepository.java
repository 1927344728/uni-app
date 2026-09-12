package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.ApiCallStatEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApiCallStatRepository extends JpaRepository<ApiCallStatEntity, Long> {
  Optional<ApiCallStatEntity> findByUserIdAndPath(Long userId, String path);
  Optional<ApiCallStatEntity> findByUserIdIsNullAndPath(String path);
}
