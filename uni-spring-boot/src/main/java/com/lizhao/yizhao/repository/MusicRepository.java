package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.MusicEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MusicRepository extends JpaRepository<MusicEntity, Long> {
  Optional<MusicEntity> findByUuid(String uuid);

  @Query("SELECT COUNT(m) FROM MusicEntity m WHERE m.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', m.type, ',') LIKE CONCAT('%,', :type, ',%'))")
  long countByTypeAndIsDeletedFalse(@Param("type") String type);

  @Query("SELECT m FROM MusicEntity m WHERE (:type IS NULL OR :type = '' OR CONCAT(',', m.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:keyword IS NULL OR :keyword = '' OR m.title LIKE %:keyword%) AND m.isDeleted = false ORDER BY m.seq DESC, m.id ASC")
  Page<MusicEntity> findMusics(@Param("type") String type, @Param("keyword") String keyword, Pageable pageable);

  List<MusicEntity> findByIdIn(List<Long> ids);

  @Query(value = "SELECT * FROM music WHERE id IN :ids ORDER BY FIND_IN_SET(id, :ids_str)", nativeQuery = true)
  List<MusicEntity> findByIdInOrder(@Param("ids") List<Long> ids, @Param("ids_str") String idsStr);

  @Query("SELECT m FROM MusicEntity m WHERE m.isDeleted = false AND (:type IS NULL OR :type = '' OR CONCAT(',', m.type, ',') LIKE CONCAT('%,', :type, ',%')) AND m.id NOT IN :playingIds AND (:playedIds IS NULL OR m.id NOT IN :playedIds) ORDER BY RAND() LIMIT 1")
  Optional<MusicEntity> findRandomMusic(@Param("type") String type, @Param("playingIds") List<Long> playingIds, @Param("playedIds") List<Long> playedIds);
}