package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.BannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<BannerEntity, Integer> {
    List<BannerEntity> findByIsDeletedFalseOrderBySeqDesc();
}