package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.VideoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<VideoEntity, Long> {
  Optional<VideoEntity> findByUuid(String uuid);

  @Query("SELECT COUNT(v) FROM VideoEntity v WHERE v.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%'))")
  long countByTypeAndIsDeletedFalse(@Param("type") String type);

  @Query("SELECT v FROM VideoEntity v WHERE (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:keyword IS NULL OR :keyword = '' OR v.title LIKE %:keyword%) AND v.isDeleted = false ORDER BY v.seq DESC, v.id ASC")
  Page<VideoEntity> findVideos(@Param("type") String type, @Param("keyword") String keyword, Pageable pageable);

  @Query(value = "SELECT * FROM video WHERE id IN :ids ORDER BY FIND_IN_SET(id, :ids_str)", nativeQuery = true)
  List<VideoEntity> findByIdInOrder(@Param("ids") List<Long> ids, @Param("ids_str") String idsStr);

  @Query("SELECT v FROM VideoEntity v WHERE v.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%')) AND v.id NOT IN :playingIds AND (:playedIds IS NULL OR v.id NOT IN :playedIds) ORDER BY RAND() LIMIT 1")
  Optional<VideoEntity> findRandomVideo(@Param("type") String type, @Param("playingIds") List<Long> playingIds, @Param("playedIds") List<Long> playedIds);
}