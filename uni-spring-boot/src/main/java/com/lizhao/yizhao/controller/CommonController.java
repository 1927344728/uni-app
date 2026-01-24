package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.BannerEntity;
import com.lizhao.yizhao.repository.BannerRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/common")
public class CommonController {

  private final BannerRepository bannerRepository;

  public CommonController(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @GetMapping("/getBannerList")
  @ResponseBody
  public CommonResponse<List<BannerEntity>> getBannerList() {
    List<BannerEntity> banner = bannerRepository.findByIsDeletedFalseOrderBySeqDesc();
    return CommonResponse.success(banner);
  }
}