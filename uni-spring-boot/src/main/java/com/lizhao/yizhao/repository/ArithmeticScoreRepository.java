package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.ArithmeticScoreEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArithmeticScoreRepository extends JpaRepository<ArithmeticScoreEntity, Long> {
  Page<ArithmeticScoreEntity> findByUserIdOrderByCreatedTimeDesc(Long userId, Pageable pageable);

  @Query("SELECT s FROM ArithmeticScoreEntity s WHERE s.userId = :userId ORDER BY s.score DESC, s.durationMs ASC, s.createdTime ASC")
  Page<ArithmeticScoreEntity> findBestByUserId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT COUNT(s) FROM ArithmeticScoreEntity s WHERE s.userId = :userId AND s.total > 0 AND s.correct = s.total")
  long countPerfectByUserId(@Param("userId") Long userId);

  @Query("SELECT COUNT(s) FROM ArithmeticScoreEntity s WHERE s.userId = :userId AND s.mode = 'king' AND s.total > 0 AND s.correct = s.total")
  long countKingPerfectByUserId(@Param("userId") Long userId);
}
