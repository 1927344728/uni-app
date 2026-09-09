package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.request.TtsSynthesizeRequest;
import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.dto.response.TtsSynthesizeResponse;
import com.lizhao.yizhao.exception.TtsException;
import com.lizhao.yizhao.service.TtsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tts")
public class TtsController {
  private static final Logger logger = LoggerFactory.getLogger(TtsController.class);

  private final TtsService ttsService;

  public TtsController(TtsService ttsService) {
    this.ttsService = ttsService;
  }

  @GetMapping("/synthesize")
  public CommonResponse<TtsSynthesizeResponse> synthesizeGet(TtsSynthesizeRequest request) {
    return synthesize(request);
  }

  @PostMapping("/synthesize")
  public CommonResponse<TtsSynthesizeResponse> synthesizePost(@RequestBody TtsSynthesizeRequest request) {
    return synthesize(request);
  }

  private CommonResponse<TtsSynthesizeResponse> synthesize(TtsSynthesizeRequest request) {
    try {
      return CommonResponse.success(ttsService.synthesize(request));
    } catch (IllegalArgumentException e) {
      return CommonResponse.fail(400, e.getMessage());
    } catch (TtsException e) {
      logger.error("语音合成失败", e);
      return CommonResponse.fail(500, e.getMessage());
    } catch (Exception e) {
      logger.error("语音合成系统错误", e);
      return CommonResponse.fail(500, e.getMessage() != null ? e.getMessage() : "语音合成失败");
    }
  }
}
