package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.BannerEntity;
import com.lizhao.yizhao.entity.CategoryEntity;
import com.lizhao.yizhao.repository.BannerRepository;
import com.lizhao.yizhao.repository.CategoryRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/common")
public class CommonController {

  private final BannerRepository bannerRepository;
  private final CategoryRepository categoryRepository;

  public CommonController(BannerRepository bannerRepository, CategoryRepository categoryRepository) {
    this.bannerRepository = bannerRepository;
    this.categoryRepository = categoryRepository;
  }

  @GetMapping("/getBannerList")
  @ResponseBody
  public CommonResponse<List<BannerEntity>> getBannerList() {
    List<BannerEntity> banner = bannerRepository.findByIsDeletedFalseOrderBySeqDesc();
    return CommonResponse.success(banner);
  }

  @GetMapping("/getCategoryEnum")
  @ResponseBody
  public CommonResponse<List<CategoryEntity>> getCategoryEnum() {
    List<CategoryEntity> category = categoryRepository.findAll();
    return CommonResponse.success(category);
  }
}