package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
  @Query("SELECT c FROM CategoryEntity c WHERE c.isDeleted = false AND (:platform IS NULL OR :platform = '' OR c.platform IS NULL OR c.platform = '' OR CONCAT(',', c.platform, ',') LIKE CONCAT('%,', :platform, ',%')) ORDER BY c.categoryId ASC, c.typeId ASC, c.subTypeId ASC, c.id ASC")
  List<CategoryEntity> findVisible(@Param("platform") String platform);
}