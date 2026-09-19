package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.UploadedFileEntity;
import com.lizhao.yizhao.exception.CosException;
import com.lizhao.yizhao.repository.UploadedFileRepository;
import com.lizhao.yizhao.service.UploadedFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/files")
public class AdminFileController {
  private static final Logger logger = LoggerFactory.getLogger(AdminFileController.class);

  private final UploadedFileService uploadedFileService;
  private final UploadedFileRepository uploadedFileRepository;

  public AdminFileController(UploadedFileService uploadedFileService, UploadedFileRepository uploadedFileRepository) {
    this.uploadedFileService = uploadedFileService;
    this.uploadedFileRepository = uploadedFileRepository;
  }

  @GetMapping
  public CommonResponse<Page<UploadedFileEntity>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String type,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(required = false) Integer pageNum,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) Integer pageSize) {
    int currentPage = pageNum != null ? pageNum : page;
    int currentSize = pageSize != null ? pageSize : size;
    List<UploadedFileEntity> filtered = uploadedFileRepository.findAll().stream()
        .filter(item -> !Boolean.TRUE.equals(item.getIsDeleted()))
        .filter(item -> matchesKeyword(item, keyword))
        .filter(item -> matchesType(item, type))
        .sorted(Comparator
            .comparing(UploadedFileEntity::getCreatedTime, Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing(UploadedFileEntity::getId, Comparator.nullsLast(Comparator.reverseOrder())))
        .toList();
    return CommonResponse.success(pageList(filtered, currentPage, currentSize));
  }

  @GetMapping("/{id}")
  public ResponseEntity<CommonResponse<UploadedFileEntity>> detail(@PathVariable Integer id) {
    Optional<UploadedFileEntity> entity = uploadedFileRepository.findById(id);
    if (entity.isEmpty() || Boolean.TRUE.equals(entity.get().getIsDeleted())) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(CommonResponse.fail(404, "文件不存在"));
    }
    return ResponseEntity.ok(CommonResponse.success(entity.get()));
  }

  @PostMapping("/upload")
  public ResponseEntity<CommonResponse<UploadedFileEntity>> upload(
      @RequestParam("file") MultipartFile file,
      @RequestParam(required = false) String dir) {
    try {
      return ResponseEntity.ok(CommonResponse.success(uploadedFileService.upload(file, dir)));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(CommonResponse.fail(400, e.getMessage()));
    } catch (CosException e) {
      logger.error("文件上传到 COS 失败", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(CommonResponse.fail(500, e.getMessage()));
    } catch (Exception e) {
      logger.error("文件上传失败", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(CommonResponse.fail(500, e.getMessage() != null ? e.getMessage() : "上传失败"));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<CommonResponse<String>> delete(@PathVariable Integer id) {
    Optional<UploadedFileEntity> entity = uploadedFileRepository.findById(id);
    if (entity.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(CommonResponse.fail(404, "文件不存在"));
    }
    try {
      uploadedFileService.deletePermanently(entity.get());
      return ResponseEntity.ok(CommonResponse.success("已永久删除"));
    } catch (CosException e) {
      logger.error("删除 COS 文件失败, id={}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(CommonResponse.fail(500, e.getMessage()));
    } catch (Exception e) {
      logger.error("删除文件失败, id={}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(CommonResponse.fail(500, e.getMessage() != null ? e.getMessage() : "删除失败"));
    }
  }

  private boolean matchesKeyword(UploadedFileEntity item, String keyword) {
    if (!StringUtils.hasText(keyword)) return true;
    String needle = keyword.toLowerCase(Locale.ROOT);
    return contains(item.getOriginalName(), needle)
        || contains(item.getUrl(), needle)
        || contains(item.getObjectKey(), needle)
        || contains(item.getMimeType(), needle);
  }

  private boolean matchesType(UploadedFileEntity item, String type) {
    if (!StringUtils.hasText(type)) return true;
    return Objects.equals(item.getFileType(), type);
  }

  private boolean contains(String value, String keyword) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
  }

  private <T> Page<T> pageList(List<T> list, int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
    int start = Math.min((int) pageable.getOffset(), list.size());
    int end = Math.min(start + pageable.getPageSize(), list.size());
    return new PageImpl<>(list.subList(start, end), pageable, list.size());
  }
}
