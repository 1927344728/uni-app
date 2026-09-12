package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.BannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<BannerEntity, Integer> {
    List<BannerEntity> findByIsDeletedFalseOrderBySeqDesc();

    @Query("SELECT b FROM BannerEntity b WHERE b.isDeleted = false AND (:platform IS NULL OR :platform = '' OR b.platform IS NULL OR b.platform = '' OR CONCAT(',', b.platform, ',') LIKE CONCAT('%,', :platform, ',%')) ORDER BY b.seq DESC, b.id ASC")
    List<BannerEntity> findVisible(@Param("platform") String platform);
}