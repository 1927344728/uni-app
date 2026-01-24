package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.BookEntity;
import com.lizhao.yizhao.repository.BookRepository;
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
@RequestMapping("/api/book")
public class BookController {

  private final BookRepository bookRepository;

  public BookController(BookRepository bookRepository) {
    this.bookRepository = bookRepository;
  }

  @GetMapping("/getBookPageList")
  @ResponseBody
  public CommonResponse<Page<BookRepository.BookSummary>> getBookPageList(
      @RequestParam (required = false) String keyword,
      @RequestParam (required = false) String type,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<BookRepository.BookSummary> books = bookRepository.findBooks(keyword, type, pageable);
    return CommonResponse.success(books);
  }

  @GetMapping("/getBookById")
  @ResponseBody
  public CommonResponse<BookEntity> getBookById(@RequestParam Long id) {
    Optional<BookEntity> book = bookRepository.findById(id);
    if (book.isPresent()) {
      return CommonResponse.success(book.get());
    } else {
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }
}