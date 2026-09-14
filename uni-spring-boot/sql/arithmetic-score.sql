-- 算术小达人：按用户保存每轮成绩
CREATE TABLE IF NOT EXISTS arithmetic_score (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  mode VARCHAR(32) NOT NULL COMMENT '题型：add10/sub10/…/king',
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0 COMMENT '本轮累计用时毫秒',
  created_time DATETIME(6) NOT NULL,
  KEY idx_arithmetic_score_user (user_id),
  KEY idx_arithmetic_score_user_best (user_id, score, duration_ms)
) COMMENT='算术小达人成绩';
