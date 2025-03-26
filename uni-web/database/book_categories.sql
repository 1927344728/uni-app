-- 创建图书分类表
CREATE TABLE IF NOT EXISTS `book_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT UNSIGNED COMMENT '父分类ID',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书分类表';

-- 插入图书分类数据
INSERT INTO `book_categories` (`name`, `parent_id`) VALUES
('中国古典文学', NULL),
('国外名著', NULL),
('人生文学', NULL),
('历史传记', NULL),
('科普读物', NULL),
('儿童读物', NULL);

-- 插入子分类
INSERT INTO `book_categories` (`name`, `parent_id`) 
SELECT '四大名著', id FROM `book_categories` WHERE name = '中国古典文学';