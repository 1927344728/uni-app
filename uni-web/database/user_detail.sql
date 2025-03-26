-- 创建用户详细信息表
CREATE TABLE IF NOT EXISTS user_detail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gender TINYINT COMMENT '性别：1-男 2-女',
    birthday BIGINT COMMENT '生日时间戳',
    education TINYINT COMMENT '学历：1-30，1-3幼儿园，4-12小学中学，13-15高中，16及以上大学',
    father_id INT COMMENT '父亲id',
    mother_id INT COMMENT '母亲id',
    sibling_ids TEXT COMMENT '兄弟姐妹id',
    spouse_id INT COMMENT '配偶id',
    children_ids TEXT COMMENT '子女id',
    created_at BIGINT NOT NULL COMMENT '创建时间',
    updated_at BIGINT NOT NULL COMMENT '更新时间',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '删除标识',
    CONSTRAINT chk_gender CHECK (gender IN (1, 2)),
    CONSTRAINT chk_education CHECK (education BETWEEN 1 AND 30)
);

-- 插入示例数据
INSERT INTO user_detail (
    gender,
    birthday,
    education,
    father_id,
    mother_id,
    sibling_ids,
    spouse_id,
    children_ids,
    created_at,
    updated_at
) VALUES (
    1, -- 性别：男
    604857600000, -- 生日：2000-01-01 00:00:00
    18, -- 学历：大学
    3, -- 父亲id
    4, -- 母亲id
    '5,6,7', -- 兄弟姐妹id
    10, -- 配偶id
    '20,21', -- 子女id
    UNIX_TIMESTAMP(), -- 创建时间
    UNIX_TIMESTAMP() -- 更新时间
); 