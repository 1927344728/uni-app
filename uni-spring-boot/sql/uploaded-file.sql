-- 管理后台：COS 上传文件元数据
-- 请在业务库执行一次。执行后需重启 uni-spring-boot（ddl-auto=validate）。
CREATE TABLE IF NOT EXISTS uploaded_file (
  id INT PRIMARY KEY AUTO_INCREMENT,
  original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  object_key VARCHAR(850) NOT NULL COMMENT 'COS 对象路径',
  url VARCHAR(1000) NOT NULL COMMENT '公网访问地址',
  file_type VARCHAR(32) NOT NULL COMMENT '文件类型：image/audio/video/other',
  mime_type VARCHAR(128) NULL COMMENT 'MIME 类型',
  size_bytes BIGINT NULL COMMENT '文件大小（字节）',
  dir VARCHAR(255) NULL COMMENT '上传目录',
  created_time BIGINT NULL COMMENT '创建时间（毫秒时间戳）',
  updated_time BIGINT NULL COMMENT '更新时间（毫秒时间戳）',
  is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '删除标识(0:正常 1:已删除)',
  KEY idx_uploaded_file_type (file_type),
  KEY idx_uploaded_file_created (created_time),
  KEY idx_uploaded_file_deleted (is_deleted),
  KEY idx_uploaded_file_object_key (object_key(255))
) COMMENT='COS 上传文件';
