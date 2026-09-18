package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
  Optional<TaskEntity> findById(Long id);

  public interface TaskSummary {
    Long getId();
    String getTitle();
    Integer getStatus();
    String getPublisher();
    String getTargeter();
    String getContent();
    Integer getSeq();
    Integer getProgress();
    String getFinished();
    Long getPublishTime();
    Long getStartTime();
    Long getEndTime();
    String getPlatform();
  }

  @Query("SELECT t.id as id, t.title as title, t.status as status, t.publisher as publisher, t.targeter as targeter, t.content as content, t.seq as seq, t.progress as progress, t.finished as finished, t.publishTime as publishTime, t.startTime as startTime, t.endTime as endTime, t.platform as platform FROM TaskEntity t WHERE (:keyword IS NULL OR :keyword = '' OR t.title LIKE %:keyword%) AND (:status IS NULL OR t.status = :status) AND (:publisher IS NULL OR :publisher = '' OR t.publisher LIKE %:publisher%) AND (:targeter IS NULL OR :targeter = '' OR t.targeter LIKE %:targeter%) AND (:platform IS NULL OR :platform = '' OR t.platform IS NULL OR t.platform = '' OR CONCAT(',', t.platform, ',') LIKE CONCAT('%,', :platform, ',%')) AND t.isDeleted = false ORDER BY COALESCE(t.seq, 0) DESC, t.id ASC")
  Page<TaskSummary> findTasks(@Param("keyword") String keyword, @Param("status") Integer status, @Param("publisher") String publisher, @Param("targeter") String targeter, @Param("platform") String platform, Pageable pageable);

  @Query("SELECT t FROM TaskEntity t WHERE t.id = :id AND t.isDeleted = false AND (:platform IS NULL OR :platform = '' OR t.platform IS NULL OR t.platform = '' OR CONCAT(',', t.platform, ',') LIKE CONCAT('%,', :platform, ',%'))")
  Optional<TaskEntity> findVisibleById(@Param("id") Long id, @Param("platform") String platform);

  @Query("SELECT DISTINCT t.targeter FROM TaskEntity t WHERE t.targeter IS NOT NULL AND t.isDeleted = false")
  List<String> findDistinctTargeters();
}