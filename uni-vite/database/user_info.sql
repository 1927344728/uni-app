-- 创建用户信息表
CREATE TABLE IF NOT EXISTS user_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    uuid VARCHAR(36) NOT NULL COMMENT '用户UUID',
    phone_number VARCHAR(11) NOT NULL COMMENT '手机号',
    name VARCHAR(256) NOT NULL COMMENT '名称',
    user_type INT NOT NULL CHECK (user_type BETWEEN 1 AND 100) COMMENT '类型',
    verification_code VARCHAR(4) COMMENT '验证码',
    token VARCHAR(255) COMMENT '用户token',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '删除标识',
    UNIQUE KEY uk_uuid (uuid),
    UNIQUE KEY uk_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 插入示例数据
INSERT INTO user_info (
    uuid,
    phone_number,
    name,
    user_type,
    verification_code,
    token
) VALUES (
    UUID(), -- 生成唯一的UUID
    '15857185220',
    '李兆',
    1,
    '1234',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' -- 示例token
);

