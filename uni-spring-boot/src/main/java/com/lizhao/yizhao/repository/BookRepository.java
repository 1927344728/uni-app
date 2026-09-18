package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.BookEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface BookRepository extends JpaRepository<BookEntity, Long> {
  Optional<BookEntity> findByType(String type);

  public interface BookSummary {
    Long getId();
    String getType();
    String getTitle();
    String getAuthor();
    String getOwner();
    String getDescription();
    BigDecimal getScore();
    Integer getSeq();
    String getCover();
    String getPlatform();
  }

  @Query("SELECT b.id as id, b.type as type, b.title as title, b.author as author, b.owner as owner, b.description as description, b.score as score, b.seq as seq, b.cover as cover, b.platform as platform FROM BookEntity b WHERE (:keyword IS NULL OR :keyword = '' OR b.title LIKE %:keyword%) AND (:type IS NULL OR :type = '' OR CONCAT(',', b.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:platform IS NULL OR :platform = '' OR b.platform IS NULL OR b.platform = '' OR CONCAT(',', b.platform, ',') LIKE CONCAT('%,', :platform, ',%')) AND b.isDeleted = false ORDER BY COALESCE(b.seq, 0) DESC, b.id ASC")
  Page<BookSummary> findBooks(@Param("keyword") String keyword, @Param("type") String type, @Param("platform") String platform, Pageable pageable);

  @Query("SELECT b FROM BookEntity b WHERE b.id = :id AND b.isDeleted = false AND (:platform IS NULL OR :platform = '' OR b.platform IS NULL OR b.platform = '' OR CONCAT(',', b.platform, ',') LIKE CONCAT('%,', :platform, ',%'))")
  Optional<BookEntity> findVisibleById(@Param("id") Long id, @Param("platform") String platform);
}