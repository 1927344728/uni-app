-- uploaded_file：时间字段改为毫秒时间戳（BIGINT）
-- 已有 TIMESTAMP 数据会先换算为毫秒再改列类型。执行后需重启 uni-spring-boot。

ALTER TABLE uploaded_file
  ADD COLUMN created_time_ms BIGINT NULL COMMENT '创建时间（毫秒时间戳）' AFTER dir,
  ADD COLUMN updated_time_ms BIGINT NULL COMMENT '更新时间（毫秒时间戳）' AFTER created_time_ms;

UPDATE uploaded_file
SET
  created_time_ms = CASE
    WHEN created_time IS NULL THEN NULL
    ELSE UNIX_TIMESTAMP(created_time) * 1000
  END,
  updated_time_ms = CASE
    WHEN updated_time IS NULL THEN NULL
    ELSE UNIX_TIMESTAMP(updated_time) * 1000
  END;

ALTER TABLE uploaded_file
  DROP COLUMN created_time,
  DROP COLUMN updated_time;

ALTER TABLE uploaded_file
  CHANGE created_time_ms created_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
  CHANGE updated_time_ms updated_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）';
