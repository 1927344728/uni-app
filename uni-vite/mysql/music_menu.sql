CREATE TABLE `music_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `icon` varchar(500) DEFAULT NULL COMMENT '歌单图标URL',
  `title` varchar(255) NOT NULL COMMENT '歌单标题',
  `desc` varchar(500) DEFAULT NULL COMMENT '歌单描述',
  `song_ids` json DEFAULT NULL COMMENT '歌曲ID列表(JSON格式)',
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标识(0:正常 1:已删除)',
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`),
  KEY `idx_created_time` (`created_time`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='歌单表';