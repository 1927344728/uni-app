package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.ArticleEntity;
import com.lizhao.yizhao.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/article")
public class ArticleController {

  private final ArticleRepository articleRepository;

  public ArticleController(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @GetMapping("/getArticlePageList")
  @ResponseBody
  public CommonResponse<Page<ArticleRepository.ArticleSummary>> getArticlePageList(
      @RequestParam (required = false) String keyword,
      @RequestParam (required = false) String type,
      @RequestParam(required = false) Integer subType,
      @RequestParam(required = false) String platform,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<ArticleRepository.ArticleSummary> articles = articleRepository.findArticles(keyword, type, subType, platform, pageable);
    return CommonResponse.success(articles);
  }

  @GetMapping("/getArticleById")
  @ResponseBody
  public CommonResponse<ArticleEntity> getArticleById(@RequestParam Long id, @RequestParam(required = false) String platform) {
    Optional<ArticleEntity> article = articleRepository.findVisibleById(id, platform);
    if (article.isPresent()) {
      return CommonResponse.success(article.get());
    } else {
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }
}