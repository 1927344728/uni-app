package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.TaskEntity;
import com.lizhao.yizhao.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/task")
public class TaskController {

  private final TaskRepository taskRepository;

  public TaskController(TaskRepository taskRepository) {
    this.taskRepository = taskRepository;
  }

  @GetMapping("/getTaskPageList")
  @ResponseBody
  public CommonResponse<Page<TaskRepository.TaskSummary>> getTaskPageList(
      @RequestParam (required = false) String title,
      @RequestParam (required = false) Integer status,
      @RequestParam(required = false) String publisher,
      @RequestParam(required = false) String targeter,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<TaskRepository.TaskSummary> tasks = taskRepository.findTasks(title, status, publisher, targeter, pageable);
    return CommonResponse.success(tasks);
  }

  @GetMapping("/getTaskById")
  @ResponseBody
  public CommonResponse<TaskEntity> getTaskById(@RequestParam Long id) {
    Optional<TaskEntity> task = taskRepository.findById(id);
    if (task.isPresent()) {
      return CommonResponse.success(task.get());
    } else {
      return CommonResponse.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器错误!");
    }
  }

  @GetMapping("/getTaskTargeterList")
  @ResponseBody
  public CommonResponse<List<String>> getTaskTargeterList() {
    List<String> targeters = taskRepository.findDistinctTargeters();
    return CommonResponse.success(targeters);
  }
}