package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.dto.response.CosUploadResponse;
import com.lizhao.yizhao.exception.CosException;
import com.lizhao.yizhao.service.CosStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cos")
public class CosController {
  private static final Logger logger = LoggerFactory.getLogger(CosController.class);

  private final CosStorageService cosStorageService;

  public CosController(CosStorageService cosStorageService) {
    this.cosStorageService = cosStorageService;
  }

  @PostMapping("/upload")
  public CommonResponse<CosUploadResponse> upload(
    @RequestParam("file") MultipartFile file,
    @RequestParam(required = false) String dir,
    @RequestParam(required = false) String fileName,
    @RequestParam(required = false) String key,
    @RequestParam(defaultValue = "false") boolean overwrite
  ) {
    try {
      return CommonResponse.success(cosStorageService.upload(file, dir, fileName, key, overwrite));
    } catch (IllegalArgumentException e) {
      return CommonResponse.fail(400, e.getMessage());
    } catch (CosException e) {
      logger.error("COS 上传失败", e);
      return CommonResponse.fail(500, e.getMessage());
    } catch (Exception e) {
      logger.error("COS 上传系统错误", e);
      return CommonResponse.fail(500, e.getMessage() != null ? e.getMessage() : "上传失败");
    }
  }
}
