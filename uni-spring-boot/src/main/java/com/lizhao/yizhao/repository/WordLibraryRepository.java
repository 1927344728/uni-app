package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.WordLibraryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WordLibraryRepository extends JpaRepository<WordLibraryEntity, Integer> {

  @Query("SELECT w FROM WordLibraryEntity w WHERE w.isDeleted = false AND (:id IS NULL OR w.id = :id)")
  Page<WordLibraryEntity> findPageByOptionalId(@Param("id") Integer id, Pageable pageable);
}
