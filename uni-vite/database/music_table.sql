-- 创建音乐信息表
CREATE TABLE IF NOT EXISTS `music` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `title` VARCHAR(255) NOT NULL COMMENT '歌曲名称',
    `singer` VARCHAR(255) NOT NULL COMMENT '艺术家',
    `album` VARCHAR(255) DEFAULT NULL COMMENT '专辑名称',
    `release_date` TIMESTAMP NULL COMMENT '发行日期',
    `genre` VARCHAR(50) DEFAULT NULL COMMENT '流派',
    `duration` INT UNSIGNED DEFAULT NULL COMMENT '时长(秒)',
    `language` VARCHAR(50) DEFAULT NULL COMMENT '语言',
    `copyright` VARCHAR(255) DEFAULT NULL COMMENT '版权信息',
    `file_format` VARCHAR(20) DEFAULT NULL COMMENT '文件格式',
    `file_size` DECIMAL(10,2) DEFAULT NULL COMMENT '文件大小(MB)',
    `play_count` BIGINT UNSIGNED DEFAULT 0 COMMENT '播放次数',
    `rating` DECIMAL(2,1) DEFAULT NULL COMMENT '评分(1-5)',
    `cover_image` VARCHAR(1024) DEFAULT NULL COMMENT '封面图片路径',
    `lyrics` TEXT DEFAULT NULL COMMENT '歌词',
    `status` TINYINT DEFAULT 1 COMMENT '状态(1:可用 0:下架)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_title` (`title`),
    INDEX `idx_artist` (`singer`),
    INDEX `idx_album` (`album`),
    INDEX `idx_release_date` (`release_date`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音乐信息表';

-- 添加评分范围约束
ALTER TABLE `music` ADD CONSTRAINT `chk_rating` 
CHECK (`rating` >= 1 AND `rating` <= 5);

-- 添加状态值约束
ALTER TABLE `music` ADD CONSTRAINT `chk_status` 
CHECK (`status` IN (0, 1)); 