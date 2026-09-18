-- 词库：删除 grade_id，改用中文 title
-- 请在业务库执行一次。执行后需重启 uni-spring-boot（ddl-auto=validate）。

ALTER TABLE `word_library`
  ADD COLUMN `title` VARCHAR(255) NULL COMMENT '词库标题' AFTER `id`;

UPDATE `word_library`
SET `title` = CASE `grade_id`
  WHEN 1 THEN '一（上）'
  WHEN 2 THEN '一（下）'
  WHEN 3 THEN '二（上）'
  WHEN 4 THEN '二（下）'
  WHEN 5 THEN '三（上）'
  WHEN 6 THEN '三（下）'
  WHEN 7 THEN '四（上）'
  WHEN 8 THEN '四（下）'
  WHEN 9 THEN '五（上）'
  WHEN 10 THEN '五（下）'
  WHEN 11 THEN '六（上）'
  WHEN 12 THEN '六（下）'
  ELSE CONCAT('词库', `id`)
END
WHERE `title` IS NULL OR `title` = '';

-- 若报 Unknown key 'idx_grade_id'，跳过下一句后继续执行后面的 ALTER
ALTER TABLE `word_library` DROP INDEX `idx_grade_id`;

ALTER TABLE `word_library`
  DROP COLUMN `grade_id`,
  MODIFY COLUMN `title` VARCHAR(255) NOT NULL COMMENT '词库标题';
