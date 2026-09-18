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
  @Query("SELECT COUNT(v) FROM VideoEntity v WHERE v.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:platform IS NULL OR :platform = '' OR v.platform IS NULL OR v.platform = '' OR CONCAT(',', v.platform, ',') LIKE CONCAT('%,', :platform, ',%'))")
  long countByTypeAndIsDeletedFalse(@Param("type") String type, @Param("platform") String platform);

  @Query("SELECT v FROM VideoEntity v WHERE (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:keyword IS NULL OR :keyword = '' OR v.title LIKE %:keyword%) AND (:platform IS NULL OR :platform = '' OR v.platform IS NULL OR v.platform = '' OR CONCAT(',', v.platform, ',') LIKE CONCAT('%,', :platform, ',%')) AND v.isDeleted = false ORDER BY COALESCE(v.seq, 0) DESC, v.updatedTime DESC, v.id ASC")
  Page<VideoEntity> findVideos(@Param("type") String type, @Param("keyword") String keyword, @Param("platform") String platform, Pageable pageable);

  @Query(value = "SELECT * FROM video WHERE id IN :ids ORDER BY FIND_IN_SET(id, :ids_str)", nativeQuery = true)
  List<VideoEntity> findByIdInOrder(@Param("ids") List<Long> ids, @Param("ids_str") String idsStr);

  @Query(value = "SELECT * FROM video WHERE id IN :ids AND is_deleted = 0 AND (:platform IS NULL OR :platform = '' OR platform IS NULL OR platform = '' OR FIND_IN_SET(:platform, platform)) ORDER BY FIND_IN_SET(id, :ids_str)", nativeQuery = true)
  List<VideoEntity> findVisibleByIdInOrder(@Param("ids") List<Long> ids, @Param("ids_str") String idsStr, @Param("platform") String platform);

  @Query("SELECT v FROM VideoEntity v WHERE v.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', v.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:platform IS NULL OR :platform = '' OR v.platform IS NULL OR v.platform = '' OR CONCAT(',', v.platform, ',') LIKE CONCAT('%,', :platform, ',%')) AND v.id NOT IN :playingIds AND (:playedIds IS NULL OR v.id NOT IN :playedIds) ORDER BY RAND() LIMIT 1")
  Optional<VideoEntity> findRandomVideo(@Param("type") String type, @Param("platform") String platform, @Param("playingIds") List<Long> playingIds, @Param("playedIds") List<Long> playedIds);

  @Query("SELECT v FROM VideoEntity v WHERE v.id = :id AND v.isDeleted = false AND (:platform IS NULL OR :platform = '' OR v.platform IS NULL OR v.platform = '' OR CONCAT(',', v.platform, ',') LIKE CONCAT('%,', :platform, ',%'))")
  Optional<VideoEntity> findVisibleById(@Param("id") Long id, @Param("platform") String platform);
}