package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.MusicMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MusicMenuRepository extends JpaRepository<MusicMenuEntity, Long> {
  List<MusicMenuEntity> findByIsDeletedFalse();
}