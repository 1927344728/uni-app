package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.VideoMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VideoMenuRepository extends JpaRepository<VideoMenuEntity, Long> {
  List<VideoMenuEntity> findByIsDeletedFalse();

  @Query("SELECT v FROM VideoMenuEntity v WHERE v.isDeleted = false AND (:platform IS NULL OR :platform = '' OR v.platform IS NULL OR v.platform = '' OR CONCAT(',', v.platform, ',') LIKE CONCAT('%,', :platform, ',%')) ORDER BY v.id ASC")
  List<VideoMenuEntity> findVisible(@Param("platform") String platform);
}