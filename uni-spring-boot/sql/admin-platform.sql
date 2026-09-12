-- 方案 A：客户端角色与后台角色拆分
-- role：1 超级管理员 / 2 家长 / 3 学生
-- admin_role：NULL 无权限 / 1 超管 / 2 管理员
ALTER TABLE `user`
  ADD COLUMN `admin_role` INT NULL COMMENT '后台角色：NULL无权限，1超管，2管理员' AFTER `role`;

-- 历史合并角色迁移：旧 role=4（管理员）→ admin_role=2，客户端身份默认家长
UPDATE `user`
SET `admin_role` = 2,
    `role` = 2
WHERE `role` = 4;

-- 旧 role=1（超管）同步写入 admin_role，客户端 role 仍保留 1
UPDATE `user`
SET `admin_role` = 1
WHERE `role` = 1 AND `admin_role` IS NULL;

-- 若已按旧方案写入 admin_role=4，统一改为 2
UPDATE `user` SET `admin_role` = 2 WHERE `admin_role` = 4;

-- 请至少指定一名超级管理员（按手机号改），否则无人可登录后台：
-- UPDATE `user` SET admin_role = 1, role = 1 WHERE phone = '13023697872' AND is_deleted = 0;
-- 如需全员可登后台（保留原客户端角色）：
-- UPDATE `user` SET admin_role = 2 WHERE is_deleted = 0 AND admin_role IS NULL;

ALTER TABLE article ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE book ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE music ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE music_menu ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE video ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE video_menu ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE banner ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE task ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE category ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';
ALTER TABLE word_library ADD COLUMN platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台';

CREATE TABLE admin_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  page_permissions TEXT NULL,
  button_permissions TEXT NULL,
  created_time DATETIME(6) NOT NULL,
  updated_time DATETIME(6) NOT NULL,
  UNIQUE KEY uk_admin_permission_user (user_id)
) COMMENT='管理后台用户权限';

CREATE TABLE api_call_stat (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  user_name VARCHAR(255) NULL,
  phone VARCHAR(11) NULL,
  path VARCHAR(255) NOT NULL,
  count BIGINT NOT NULL DEFAULT 0,
  created_time DATETIME(6) NOT NULL,
  updated_time DATETIME(6) NOT NULL,
  UNIQUE KEY uk_api_call_stat_user_path (user_id, path),
  KEY idx_api_call_stat_user_id (user_id),
  KEY idx_api_call_stat_path (path)
) COMMENT='接口调用统计';

CREATE TABLE home_entry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  image VARCHAR(500) NULL,
  jump_to VARCHAR(50) NULL,
  url VARCHAR(500) NULL,
  seq INT NULL,
  platform VARCHAR(100) NULL COMMENT '展示平台，null 表示全部平台',
  created_time DATETIME(6) NULL,
  updated_time DATETIME(6) NULL,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_home_entry_key (`key`)
) COMMENT='快捷入口';

INSERT INTO home_entry (`key`, name, image, jump_to, url, seq, platform, created_time, updated_time, is_deleted)
VALUES
  ('task', '任务中心', 'https://assets.izhao.com.cn/images/d502c279bba37f3dfe78158803cfff37.jpg', 'navigate', '/pages/task/index', 400, NULL, NOW(6), NOW(6), 0),
  ('book', '我的书单', 'https://assets.izhao.com.cn/images/d4f59adc3c18b9289aef1f340a93357e.jpg', 'navigate', '/pages/book/index', 300, NULL, NOW(6), NOW(6), 0),
  ('audio', '音乐收藏', 'https://assets.izhao.com.cn/images/d055efbe683f9117949d5fa4088f0d55.jpg', 'navigate', '/pages/music/index', 200, 'h5,app-plus', NOW(6), NOW(6), 0),
  ('video', '视频订阅', 'https://assets.izhao.com.cn/images/147d5438ef903fcbbac27fc51b5627c8.jpg', 'navigate', '/pages/video/index?type=1', 100, NULL, NOW(6), NOW(6), 0);
