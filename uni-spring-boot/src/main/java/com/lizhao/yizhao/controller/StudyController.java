package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.WordLibraryEntity;
import com.lizhao.yizhao.repository.WordLibraryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study")
public class StudyController {

  private final WordLibraryRepository wordLibraryRepository;

  public StudyController(WordLibraryRepository wordLibraryRepository) {
    this.wordLibraryRepository = wordLibraryRepository;
  }

  @GetMapping("/getChineseWordList")
  @ResponseBody
  public CommonResponse<Page<WordLibraryEntity>> getChineseWordList(
      @RequestParam(required = false) Integer id,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<WordLibraryEntity> page = wordLibraryRepository.findPageByOptionalId(id, pageable);
    return CommonResponse.success(page);
  }
}
