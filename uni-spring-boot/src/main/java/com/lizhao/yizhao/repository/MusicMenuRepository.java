package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.MusicMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MusicMenuRepository extends JpaRepository<MusicMenuEntity, Long> {
  List<MusicMenuEntity> findByIsDeletedFalse();

  @Query("SELECT m FROM MusicMenuEntity m WHERE m.isDeleted = false AND (:platform IS NULL OR :platform = '' OR m.platform IS NULL OR m.platform = '' OR CONCAT(',', m.platform, ',') LIKE CONCAT('%,', :platform, ',%')) ORDER BY m.id ASC")
  List<MusicMenuEntity> findVisible(@Param("platform") String platform);
}