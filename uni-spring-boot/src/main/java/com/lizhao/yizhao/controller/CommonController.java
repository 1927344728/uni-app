package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.BannerEntity;
import com.lizhao.yizhao.entity.CategoryEntity;
import com.lizhao.yizhao.entity.HomeEntryEntity;
import com.lizhao.yizhao.repository.BannerRepository;
import com.lizhao.yizhao.repository.CategoryRepository;
import com.lizhao.yizhao.repository.HomeEntryRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/common")
public class CommonController {

  private final BannerRepository bannerRepository;
  private final CategoryRepository categoryRepository;
  private final HomeEntryRepository homeEntryRepository;

  public CommonController(BannerRepository bannerRepository, CategoryRepository categoryRepository, HomeEntryRepository homeEntryRepository) {
    this.bannerRepository = bannerRepository;
    this.categoryRepository = categoryRepository;
    this.homeEntryRepository = homeEntryRepository;
  }

  @GetMapping("/getBannerList")
  @ResponseBody
  public CommonResponse<List<BannerEntity>> getBannerList(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String platform) {
    List<BannerEntity> banner = bannerRepository.findVisible(type, platform);
    return CommonResponse.success(banner);
  }

  @GetMapping("/getCategoryEnum")
  @ResponseBody
  public CommonResponse<List<CategoryEntity>> getCategoryEnum(@RequestParam(required = false) String platform) {
    List<CategoryEntity> category = categoryRepository.findVisible(platform);
    return CommonResponse.success(category);
  }

  @GetMapping("/getHomeEntryList")
  @ResponseBody
  public CommonResponse<List<HomeEntryEntity>> getHomeEntryList(
      @RequestParam(required = false) String platform,
      @RequestParam(defaultValue = "4") int limit) {
    Pageable pageable = PageRequest.of(0, Math.max(limit, 1));
    return CommonResponse.success(homeEntryRepository.findVisible(platform, pageable));
  }
}