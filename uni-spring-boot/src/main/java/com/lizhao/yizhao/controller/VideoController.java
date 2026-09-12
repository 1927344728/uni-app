package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.VideoEntity;
import com.lizhao.yizhao.entity.VideoMenuEntity;
import com.lizhao.yizhao.repository.VideoRepository;
import com.lizhao.yizhao.repository.VideoMenuRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/video")
public class VideoController {

  private final VideoRepository videoRepository;
  private final VideoMenuRepository videoMenuRepository;

  public VideoController(VideoRepository videoRepository, VideoMenuRepository videoMenuRepository) {
    this.videoRepository = videoRepository;
    this.videoMenuRepository = videoMenuRepository;
  }

  @GetMapping("/getVideoMenuList")
  @ResponseBody
  public CommonResponse<List<VideoMenuEntity>> getVideoMenuList(@RequestParam(required = false) String platform) {
    List<VideoMenuEntity> videoMenus = videoMenuRepository.findVisible(platform);
    return CommonResponse.success(videoMenus);
  }

  @GetMapping("/getVideoPageList")
  @ResponseBody
  public CommonResponse<Page<VideoEntity>> getVideoPageList(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String platform,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<VideoEntity> videos = videoRepository.findVideos(type, keyword, platform, pageable);
    return CommonResponse.success(videos);
  }

  @GetMapping("/getVideoById")
  @ResponseBody
  public CommonResponse<VideoEntity> getVideoById(@RequestParam Long id, @RequestParam(required = false) String platform) {
    Optional<VideoEntity> video = videoRepository.findVisibleById(id, platform);
    if (video.isPresent()) {
      return CommonResponse.success(video.get());
    } else {
      return CommonResponse.fail(HttpStatus.NOT_FOUND.value(), "视频不存在");
    }
  }

  @GetMapping("/getVideoByIds")
  @ResponseBody
  public CommonResponse<List<VideoEntity>> getVideoByIds(@RequestParam List<Long> ids, @RequestParam(required = false) String platform) {
    String idsStr = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    List<VideoEntity> videos = videoRepository.findVisibleByIdInOrder(ids, idsStr, platform);
    return CommonResponse.success(videos);
  }

  @GetMapping("/getVideoByRandom")
  @ResponseBody
  public CommonResponse<VideoEntity> getVideoByRandom(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String platform,
      @RequestParam(required = false) List<Long> playingIds,
      @RequestParam(required = false) List<Long> playedIds) {
    long totalCount = videoRepository.countByTypeAndIsDeletedFalse(type, platform);
    Optional<VideoEntity> video;
    int playedCount = 0;
    int playingCount = 0;
    if (playedIds != null) {
      playedCount = playedIds.size();
    }
    if (playingIds != null) {
      playingCount = playingIds.size();
    }
    if (playedIds != null && (playedCount + playingCount) >= totalCount) {
      // 如果 playedIds + playingIds 长度等于或大于所有记录，忽略 playedIds
      video = videoRepository.findRandomVideo(type, platform, playingIds, null);
    } else {
      video = videoRepository.findRandomVideo(type, platform, playingIds, playedIds);
    }
    if (video.isPresent()) {
      return CommonResponse.success(video.get());
    } else {
      return CommonResponse.fail(HttpStatus.NOT_FOUND.value(), "没有找到合适的视频");
    }
  }
}