package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.request.ArithmeticScoreRequest;
import com.lizhao.yizhao.dto.response.ArithmeticStatsResponse;
import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.ArithmeticScoreEntity;
import com.lizhao.yizhao.service.ArithmeticScoreService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study")
public class ArithmeticController {
  private final ArithmeticScoreService arithmeticScoreService;

  public ArithmeticController(ArithmeticScoreService arithmeticScoreService) {
    this.arithmeticScoreService = arithmeticScoreService;
  }

  @PostMapping("/saveArithmeticScore")
  @ResponseBody
  public CommonResponse<ArithmeticScoreEntity> saveArithmeticScore(@RequestBody ArithmeticScoreRequest request) {
    try {
      return CommonResponse.success(arithmeticScoreService.save(request));
    } catch (IllegalStateException e) {
      return CommonResponse.fail(401, e.getMessage());
    } catch (IllegalArgumentException e) {
      return CommonResponse.fail(400, e.getMessage());
    }
  }

  @GetMapping("/getArithmeticStats")
  @ResponseBody
  public CommonResponse<ArithmeticStatsResponse> getArithmeticStats() {
    try {
      return CommonResponse.success(arithmeticScoreService.stats());
    } catch (IllegalStateException e) {
      return CommonResponse.fail(401, e.getMessage());
    }
  }

  @GetMapping("/getArithmeticScorePageList")
  @ResponseBody
  public CommonResponse<Page<ArithmeticScoreEntity>> getArithmeticScorePageList(
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "20") int pageSize) {
    try {
      return CommonResponse.success(arithmeticScoreService.page(pageNum, pageSize));
    } catch (IllegalStateException e) {
      return CommonResponse.fail(401, e.getMessage());
    }
  }
}
