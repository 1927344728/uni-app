package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.ArticleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {
  Optional<ArticleEntity> findByType(String type);

  public interface ArticleSummary {
    Long getId();
    String getType();
    Integer getSubType();
    String getTitle();
    String getAuthor();
    String getNote();
    Integer getSeq();
    String getClassName();
    String getThumb();
    String getUrl();
    String getJumpTo();
    String getPlatform();
  }

  @Query("SELECT a.id as id, a.type as type, a.subType as subType, a.title as title, a.author as author, a.note as note, a.seq as seq, a.className as className, a.thumb as thumb, a.url as url, a.jumpTo as jumpTo, a.platform as platform FROM ArticleEntity a WHERE (:keyword IS NULL OR :keyword = '' OR a.title LIKE %:keyword%) AND (:type IS NULL OR :type = '' OR CONCAT(',', a.type, ',') LIKE CONCAT('%,', :type, ',%')) AND (:subType IS NULL OR a.subType = :subType) AND (:platform IS NULL OR :platform = '' OR a.platform IS NULL OR a.platform = '' OR CONCAT(',', a.platform, ',') LIKE CONCAT('%,', :platform, ',%')) AND a.isDeleted = false ORDER BY COALESCE(a.seq, 0) DESC, a.updatedTime DESC, a.id ASC")
  Page<ArticleSummary> findArticles(@Param("keyword") String keyword, @Param("type") String type, @Param("subType") Integer subType, @Param("platform") String platform, Pageable pageable);

  @Query("SELECT a FROM ArticleEntity a WHERE a.id = :id AND a.isDeleted = false AND (:platform IS NULL OR :platform = '' OR a.platform IS NULL OR a.platform = '' OR CONCAT(',', a.platform, ',') LIKE CONCAT('%,', :platform, ',%'))")
  Optional<ArticleEntity> findVisibleById(@Param("id") Long id, @Param("platform") String platform);
}