package com.lizhao.yizhao.service;

import com.lizhao.yizhao.config.authority.UserDetailsImpl;
import com.lizhao.yizhao.dto.request.ArithmeticScoreRequest;
import com.lizhao.yizhao.dto.response.ArithmeticStatsResponse;
import com.lizhao.yizhao.entity.ArithmeticScoreEntity;
import com.lizhao.yizhao.repository.ArithmeticScoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ArithmeticScoreService {
  public static final String[] LEVEL_NAMES = {
      "",
      "算术新手",
      "算术能手",
      "算术高手",
      "超级小达人",
      "算术小王者"
  };

  private static final Set<String> MODES = Set.of(
      "add10", "sub10", "add20", "sub20", "add100", "sub100", "mul10", "div10", "king"
  );
  private static final Set<Integer> TOTALS = Set.of(10, 20, 30);
  private static final int FULL_SCORE = 100;

  private final ArithmeticScoreRepository arithmeticScoreRepository;

  public ArithmeticScoreService(ArithmeticScoreRepository arithmeticScoreRepository) {
    this.arithmeticScoreRepository = arithmeticScoreRepository;
  }

  public Long requireUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl details && details.getId() != null) {
      return details.getId();
    }
    throw new IllegalStateException("请登录");
  }

  public ArithmeticScoreEntity save(ArithmeticScoreRequest request) {
    Long userId = requireUserId();
    String mode = request.getMode() == null ? "" : request.getMode().trim();
    if (!MODES.contains(mode)) {
      throw new IllegalArgumentException("题型无效");
    }
    Integer total = request.getTotal();
    Integer correct = request.getCorrect();
    Integer score = request.getScore();
    Integer maxScore = request.getMaxScore();
    Integer durationMs = request.getDurationMs() == null ? 0 : request.getDurationMs();
    if (total == null || !TOTALS.contains(total)) {
      throw new IllegalArgumentException("题量无效");
    }
    if (correct == null || correct < 0 || correct > total) {
      throw new IllegalArgumentException("答对题数无效");
    }
    int expectedScore = (int) Math.round(correct * (double) FULL_SCORE / total);
    if (score == null || score != expectedScore) {
      throw new IllegalArgumentException("分数无效");
    }
    if (maxScore == null || maxScore != FULL_SCORE) {
      throw new IllegalArgumentException("满分无效");
    }
    if (durationMs < 0 || durationMs > 24 * 60 * 60 * 1000) {
      throw new IllegalArgumentException("用时无效");
    }

    ArithmeticScoreEntity entity = new ArithmeticScoreEntity();
    entity.setUserId(userId);
    entity.setMode(mode);
    entity.setScore(score);
    entity.setMaxScore(maxScore);
    entity.setCorrect(correct);
    entity.setTotal(total);
    entity.setDurationMs(durationMs);
    return arithmeticScoreRepository.save(entity);
  }

  public ArithmeticStatsResponse stats() {
    Long userId = requireUserId();
    long perfectCount = arithmeticScoreRepository.countPerfectByUserId(userId);
    long kingPerfectCount = arithmeticScoreRepository.countKingPerfectByUserId(userId);
    int level = computeLevel(perfectCount, kingPerfectCount);

    ArithmeticStatsResponse response = new ArithmeticStatsResponse();
    response.setLevel(level);
    response.setLevelName(LEVEL_NAMES[level]);
    response.setPerfectCount(perfectCount);
    response.setKingPerfectCount(kingPerfectCount);

    arithmeticScoreRepository.findBestByUserId(userId, PageRequest.of(0, 1))
        .stream()
        .findFirst()
        .ifPresentOrElse(best -> {
          response.setBestScore(best.getScore());
          response.setBestDurationMs(best.getDurationMs());
        }, () -> {
          response.setBestScore(0);
          response.setBestDurationMs(0);
        });
    return response;
  }

  public Page<ArithmeticScoreEntity> page(int pageNum, int pageSize) {
    Long userId = requireUserId();
    return arithmeticScoreRepository.findByUserIdOrderByCreatedTimeDesc(userId, PageRequest.of(pageNum, pageSize));
  }

  public static int computeLevel(long perfectCount, long kingPerfectCount) {
    if (perfectCount > 50 && kingPerfectCount >= 10) {
      return 5;
    }
    if (perfectCount > 50) {
      return 4;
    }
    if (perfectCount > 20) {
      return 3;
    }
    if (perfectCount > 10) {
      return 2;
    }
    return 1;
  }
}
