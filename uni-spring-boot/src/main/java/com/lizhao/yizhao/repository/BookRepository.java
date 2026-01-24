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
  Optional<BookEntity> findByUuid(String uuid);
  Optional<BookEntity> findByType(String type);

  public interface BookSummary {
    Long getId();
    String getUuid();
    String getType();
    String getTitle();
    String getAuthor();
    String getOwner();
    String getDescription();
    BigDecimal getScore();
    Integer getSeq();
    String getCover();
  }

  @Query("SELECT b.id as id, b.uuid as uuid, b.type as type, b.title as title, b.author as author, b.owner as owner, b.description as description, b.score as score, b.seq as seq, b.cover as cover FROM BookEntity b WHERE (:keyword IS NULL OR :keyword = '' OR b.title LIKE %:keyword%) AND (:type IS NULL OR :type = '' OR CONCAT(',', b.type, ',') LIKE CONCAT('%,', :type, ',%')) AND b.isDeleted = false ORDER BY b.seq DESC")
  Page<BookSummary> findBooks(@Param("keyword") String keyword, @Param("type") String type, Pageable pageable);
}