package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.VideoMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoMenuRepository extends JpaRepository<VideoMenuEntity, Long> {
  List<VideoMenuEntity> findByIsDeletedFalse();
}