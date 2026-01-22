CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_id` int NOT NULL COMMENT '分类ID',
  `category_name` varchar(100) NOT NULL COMMENT '分类名称',
  `type_id` int DEFAULT NULL COMMENT '类型ID',
  `type_name` varchar(100) DEFAULT NULL COMMENT '类型名称',
  `sub_type_id` int DEFAULT NULL COMMENT '子类型ID',
  `sub_type_name` varchar(100) DEFAULT NULL COMMENT '子类型名称',
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标识(0:正常 1:已删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_type` (`category_id`, `type_id`, `sub_type_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_created_time` (`created_time`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='分类类型映射表';