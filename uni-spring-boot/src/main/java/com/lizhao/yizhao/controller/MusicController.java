package com.lizhao.yizhao.controller;

import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.MusicEntity;
import com.lizhao.yizhao.entity.MusicMenuEntity;
import com.lizhao.yizhao.repository.MusicRepository;
import com.lizhao.yizhao.repository.MusicMenuRepository;
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
@RequestMapping("/api/music")
public class MusicController {

  private final MusicRepository musicRepository;
  private final MusicMenuRepository musicMenuRepository;

  public MusicController(MusicRepository musicRepository, MusicMenuRepository musicMenuRepository) {
    this.musicRepository = musicRepository;
    this.musicMenuRepository = musicMenuRepository;
  }

  @GetMapping("/getMusicMenuList")
  @ResponseBody
  public CommonResponse<List<MusicMenuEntity>> getMusicMenuList() {
    List<MusicMenuEntity> musicMenus = musicMenuRepository.findByIsDeletedFalse();
    return CommonResponse.success(musicMenus);
  }

  @GetMapping("/getMusicPageList")
  @ResponseBody
  public CommonResponse<Page<MusicEntity>> getMusicPageList(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "0") int pageNum,
      @RequestParam(defaultValue = "10") int pageSize) {
    Pageable pageable = PageRequest.of(pageNum, pageSize);
    Page<MusicEntity> musics = musicRepository.findMusics(type, keyword, pageable);
    return CommonResponse.success(musics);
  }

  @GetMapping("/getMusicById")
  @ResponseBody
  public CommonResponse<MusicEntity> getMusicById(@RequestParam Long id) {
    Optional<MusicEntity> music = musicRepository.findById(id);
    if (music.isPresent()) {
      return CommonResponse.success(music.get());
    } else {
      return CommonResponse.fail(HttpStatus.NOT_FOUND.value(), "音乐不存在");
    }
  }

  @GetMapping("/getMusicByIds")
  @ResponseBody
  public CommonResponse<List<MusicEntity>> getMusicByIds(@RequestParam List<Long> ids) {
    String idsStr = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    List<MusicEntity> musics = musicRepository.findByIdInOrder(ids, idsStr);
    return CommonResponse.success(musics);
  }

  @GetMapping("/getMusicByRandom")
  @ResponseBody
  public CommonResponse<MusicEntity> getMusicByRandom(
      @RequestParam(required = false) String type,
      @RequestParam(required = false) List<Long> playingIds,
      @RequestParam(required = false) List<Long> playedIds) {
    long totalCount = musicRepository.countByTypeAndIsDeletedFalse(type);
    Optional<MusicEntity> music;
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
      music = musicRepository.findRandomMusic(type, playingIds, null);
    } else {
      music = musicRepository.findRandomMusic(type, playingIds, playedIds);
    }
    if (music.isPresent()) {
      return CommonResponse.success(music.get());
    } else {
      return CommonResponse.fail(HttpStatus.NOT_FOUND.value(), "没有找到合适的音乐");
    }
  }
}