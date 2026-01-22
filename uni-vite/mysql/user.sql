/*
 Navicat Premium Dump SQL

 Source Server         : lizhao
 Source Server Type    : MySQL
 Source Server Version : 80400 (8.4.0)
 Source Host           : localhost:3306
 Source Schema         : yizhao

 Target Server Type    : MySQL
 Target Server Version : 80400 (8.4.0)
 File Encoding         : 65001

 Date: 22/01/2026 23:11:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uuid` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户UUID',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '手机号',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `sex` tinyint(1) NULL DEFAULT NULL,
  `birthday` timestamp NULL DEFAULT NULL,
  `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `role` int NOT NULL COMMENT '类型（1-100）\r\n1-管理员 \r\n2-家长 \r\n3-学生',
  `password` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `captcha` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '验证码',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户token',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '删除标识',
  PRIMARY KEY (`id` DESC) USING BTREE,
  UNIQUE INDEX `uk_uuid`(`uuid` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE,
  CONSTRAINT `user_chk_1` CHECK (`role` between 1 and 100)
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '1e94b31a08c911f09ea4b4a9fc7c4063', '15857185220', '李兆', 1, NULL, 'lizhao', '人过天涯', NULL, 1, '123456', '123456', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxNTg1NzE4NTIyMCIsImlhdCI6MTc1NTY5MDQ1MSwiZXhwIjoxNzU1Nzc2ODUxfQ._-WzkFfNhvBxINyNRDNzEQHqyVitbYxWTA-KxjNydJVQWMY3xeMI5sDFVVQ9IujNR73SD1fZAwYE3oFxclDgFQ', '2025-03-25 00:00:34', '2026-01-22 22:40:42', 0);

SET FOREIGN_KEY_CHECKS = 1;
