package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.HomeEntryEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HomeEntryRepository extends JpaRepository<HomeEntryEntity, Long> {
  @Query("SELECT h FROM HomeEntryEntity h WHERE h.isDeleted = false AND (:platform IS NULL OR :platform = '' OR h.platform IS NULL OR h.platform = '' OR CONCAT(',', h.platform, ',') LIKE CONCAT('%,', :platform, ',%')) ORDER BY COALESCE(h.seq, 0) DESC, h.updatedTime DESC, h.id ASC")
  List<HomeEntryEntity> findVisible(@Param("platform") String platform, Pageable pageable);
}
