-- 创建书籍信息表
CREATE TABLE IF NOT EXISTS `books` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `title` VARCHAR(255) NOT NULL COMMENT '书名',
    `author` VARCHAR(100) NOT NULL COMMENT '作者',
    `language` VARCHAR(50) NOT NULL DEFAULT 'zh-CN' COMMENT '书籍语言',
    `isbn` CHAR(13) NOT NULL COMMENT 'ISBN号',
    `publisher` VARCHAR(100) NOT NULL COMMENT '出版社',
    `publish_date` DATE COMMENT '出版日期',
    `weight` DECIMAL(10,2) UNSIGNED NOT NULL COMMENT '商品重量(克)',
    `price` DECIMAL(10,2) NOT NULL COMMENT '定价',
    `stock` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '库存数量',
    `category_id` BIGINT UNSIGNED COMMENT '分类ID',
    `cover_image` VARCHAR(255) COMMENT '封面图片路径',
    `description` TEXT COMMENT '书籍简介',
    `format` ENUM('16开', '大16开', '32开', '大32开', '64开', '其他') NOT NULL DEFAULT '其他' COMMENT '书籍开本',
    `dimensions` VARCHAR(50) COMMENT '书籍尺寸(长×宽×厚,mm)',
    `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态(1:可售 0:下架)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_isbn` (`isbn`),
    KEY `idx_category` (`category_id`),
    KEY `idx_title` (`title`),
    KEY `idx_author` (`author`),
    KEY `idx_status` (`status`),
    KEY `idx_publish_date` (`publish_date`),
    CONSTRAINT `chk_weight` CHECK (`weight` >= 0),
    CONSTRAINT `chk_price` CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍信息表';


-- 插入示例书籍数据
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`,`cover_image`, `description`, `format`, `dimensions`, `status`) 
VALUES
(
    '道德经', '老子', 'zh-CN', '9787101003048', '中华书局',
    '2020-01-01', 280.50, 28.00, 100, 
    (SELECT id FROM book_categories WHERE name = '中国古典文学'),
    'https://img2.doubanio.com/view/subject/l/public/s1772847.jpg',
    '《道德经》是中国古代道家学派的经典著作，相传为春秋时期老子所著。全书约五千言，分上下两篇，阐述了道家的哲学思想、政治主张和处世原则等。',
    '32开', '185×128×15', 1
),
(
    '山海经', '佚名', 'zh-CN', '9787101003055', '中华书局',
    '2019-06-01', 320.00, 32.00, 80,
    (SELECT id FROM book_categories WHERE name = '中国古典文学'),
    'https://img2.doubanio.com/view/subject/l/public/s1598312.jpg',
    '《山海经》是中国先秦重要的古籍，记载了中国古代的地理、神话、动物、植物、矿物、民族、医药和民俗等方面的内容。',
    '大32开', '210×140×20', 1
);

-- 插入四大名著相关书籍
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`,`cover_image`, `description`, `format`, `dimensions`, `status`
) VALUES
(
    '红楼梦（全二册）', '曹雪芹', 'zh-CN', '9787020002207', '人民文学出版社',
    '2018-06-01', 1250.00, 59.70, 200, 
    (SELECT id FROM book_categories WHERE name = '四大名著'),
    'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg',
    '《红楼梦》是一部百科全书式的长篇小说。以宝黛爱情悲剧为主线，以四大家族的荣辱兴衰为背景，描绘了一批举止见识出于须眉之上的闺阁佳人的命运悲剧。',
    '32开', '185×127×88', 1
),
(
    '三国演义（全二册）', '罗贯中', 'zh-CN', '9787020008728', '人民文学出版社',
    '2018-08-01', 1180.00, 39.50, 150, 
    (SELECT id FROM book_categories WHERE name = '四大名著'),
    'https://img2.doubanio.com/view/subject/l/public/s1076932.jpg',
    '《三国演义》是中国第一部长篇章回体历史演义小说，描写了从东汉末年到西晋初年之间近百年的历史风云。',
    '32开', '185×127×82', 1
),
(
    '水浒传（全二册）', '施耐庵', 'zh-CN', '9787020008735', '人民文学出版社',
    '2018-07-01', 1220.00, 44.50, 180, 
    (SELECT id FROM book_categories WHERE name = '四大名著'),
    'https://img2.doubanio.com/view/subject/l/public/s1436519.jpg',
    '《水浒传》是中国历史上第一部以农民起义为题材的长篇章回小说，描写了以宋江为首的一百零八位好汉的故事。',
    '32开', '185×127×85', 1
),
(
    '西游记（全二册）', '吴承恩', 'zh-CN', '9787020008742', '人民文学出版社',
    '2018-09-01', 1150.00, 47.20, 160, 
    (SELECT id FROM book_categories WHERE name = '四大名著'),
    'https://img2.doubanio.com/view/subject/l/public/s1627374.jpg',
    '《西游记》是中国古代第一部浪漫主义长篇神魔小说，描写了孙悟空保护唐僧西天取经的故事。',
    '32开', '185×127×80', 1
);

-- 插入国外名著
INSERT INTO `books` (
    `title`, `author`, `language`, `isbn`, `publisher`, 
    `publish_date`, `weight`, `price`, `stock`, `category_id`,
    `cover_image`, `description`, `format`, `dimensions`, `status`
) VALUES
(
    '傲慢与偏见', '简·奥斯汀', 'zh-CN', '9787020090006', '人民文学出版社',
    '2019-01-15', 420.00, 32.00, 120, 
    (SELECT id FROM book_categories WHERE name = '国外名著'),
    'https://img2.doubanio.com/view/subject/l/public/s4250062.jpg',
    '《傲慢与偏见》是简·奥斯汀的代表作，是一部描写爱情与婚姻的经典小说。',
    '32开', '185×127×25', 1
),
(
    '战争与和平（全四册）', '列夫·托尔斯泰', 'zh-CN', '9787020090013', '人民文学出版社',
    '2019-02-01', 2100.00, 128.00, 80, 
    (SELECT id FROM book_categories WHERE name = '国外名著'),
    'https://img2.doubanio.com/view/subject/l/public/s1988674.jpg',
    '《战争与和平》是托尔斯泰的代表作，被誉为"世界上最伟大的小说"。',
    '32开', '185×127×148', 1
);

-- 插入科普读物
INSERT INTO `books` (
    `title`, `author`, `language`, `isbn`, `publisher`, 
    `publish_date`, `weight`, `price`, `stock`, `category_id`,
    `cover_image`, `description`, `format`, `dimensions`, `status`
) VALUES
(
    '时间简史（插图本）', '史蒂芬·霍金', 'zh-CN', '9787535732309', '湖南科技出版社',
    '2019-06-01', 450.00, 45.00, 200, 
    (SELECT id FROM book_categories WHERE name = '科普读物'),
    'https://img2.doubanio.com/view/subject/l/public/s1775746.jpg',
    '《时间简史》是著名物理学家史蒂芬·霍金的科普著作，讲述了宇宙的起源和发展。',
    '大16开', '210×140×22', 1
),
(
    '人类简史：从动物到上帝', '尤瓦尔·赫拉利', 'zh-CN', '9787508647357', '中信出版社',
    '2019-08-01', 560.00, 68.00, 150, 
    (SELECT id FROM book_categories WHERE name = '科普读物'),
    'https://img2.doubanio.com/view/subject/l/public/s27814883.jpg',
    '《人类简史》是一部跨学科的人类历史著作，讲述了人类如何从一种普通的动物演变成为地球的主宰。',
    '大16开', '210×140×28', 1
);

-- 插入儿童读物
INSERT INTO `books` (
    `title`, `author`, `language`, `isbn`, `publisher`, 
    `publish_date`, `weight`, `price`, `stock`, `category_id`,
    `cover_image`, `description`, `format`, `dimensions`, `status`
) VALUES
(
    '小王子', '安托万·德·圣-埃克苏佩里', 'zh-CN', '9787020042494', '人民文学出版社',
    '2019-03-01', 180.00, 22.00, 300, 
    (SELECT id FROM book_categories WHERE name = '儿童读物'),
    'https://img2.doubanio.com/view/subject/l/public/s1103152.jpg',
    '《小王子》是一部充满诗意的童话故事，讲述了小王子从自己的星球到地球的奇遇。',
    '32开', '185×127×12', 1
),
(
    '安徒生童话故事集', '安徒生', 'zh-CN', '9787020042500', '人民文学出版社',
    '2019-04-01', 420.00, 35.00, 250, 
    (SELECT id FROM book_categories WHERE name = '儿童读物'),
    'https://img2.doubanio.com/view/subject/l/public/s1034062.jpg',
    '《安徒生童话故事集》收录了安徒生创作的最经典的童话故事。',
    '32开', '185×127×25', 1
);

-- 插入历史传记
INSERT INTO `books` (
    `title`, `author`, `language`, `isbn`, `publisher`, 
    `publish_date`, `weight`, `price`, `stock`, `category_id`,
    `cover_image`, `description`, `format`, `dimensions`, `status`
) VALUES
(
    '曾国藩传', '张宏杰', 'zh-CN', '9787108061119', '生活·读书·新知三联书店',
    '2019-05-01', 680.00, 68.00, 120, 
    (SELECT id FROM book_categories WHERE name = '历史传记'),
    'https://img2.doubanio.com/view/subject/l/public/s1426308.jpg',
    '本书全面展现了曾国藩的一生，深入分析了他的思想、性格和历史贡献。',
    '大32开', '210×140×32', 1
),
(
    '李鸿章传', '梁启超', 'zh-CN', '9787101003062', '中华书局',
    '2019-06-01', 520.00, 42.00, 100, 
    (SELECT id FROM book_categories WHERE name = '历史传记'),
    'https://img2.doubanio.com/view/subject/l/public/s1469380.jpg',
    '本书是梁启超撰写的传记，详细记述了李鸿章的一生及其对近代中国的影响。',
    '32开', '185×127×28', 1
);

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('论语', '孔子及其弟子', 'zh-CN', '9787101003093', '中华书局', '2019-09-01', 360.00, 32.00, 180, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1305062.jpg', '《论语》记录了孔子及其弟子的言行，是儒家思想的重要经典。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('孟子', '孟子及其弟子', 'zh-CN', '9787101003109', '中华书局', '2019-10-01', 380.00, 34.00, 160, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1451126.jpg', '《孟子》是战国时期思想家孟子及其弟子的言论记录，阐述了仁政思想。', '32开', '185×127×22', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('简爱', '夏洛蒂·勃朗特', 'zh-CN', '9787020090068', '人民文学出版社', '2019-07-01', 480.00, 39.00, 140, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1108579.jpg', '《简爱》是一部描写孤女成长的小说，展现了女性追求独立与自由的精神。', '32开', '185×127×28', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('飘', '玛格丽特·米切尔', 'zh-CN', '9787020090075', '人民文学出版社', '2019-08-01', 920.00, 68.00, 120, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1078958.jpg', '《飘》是一部描写美国南北战争时期的爱情小说，以郝思嘉为主角展开故事。', '32开', '185×127×52', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('围城', '钱钟书', 'zh-CN', '9787020090081', '人民文学出版社', '2019-09-01', 420.00, 39.00, 160, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg', '《围城》是钱钟书的代表作，描写了知识分子的婚姻生活和精神世界。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('人间词话', '王国维', 'zh-CN', '9787020090099', '人民文学出版社', '2019-10-01', 280.00, 25.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1670411.jpg', '《人间词话》是王国维的文学批评著作，阐述了"境界"说等重要理论。', '32开', '185×127×18', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('从一到无穷大', '乔治·伽莫夫', 'zh-CN', '9787535732323', '湖南科技出版社', '2019-11-01', 420.00, 42.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s2516920.jpg', '《从一到无穷大》是一本科普经典，介绍了从微观到宏观的科学知识。', '大16开', '210×140×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('失控', '凯文·凯利', 'zh-CN', '9787508647371', '中信出版社', '2019-12-01', 680.00, 88.00, 100, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s4554820.jpg', '《失控》探讨了科技发展对社会的影响，预测了未来科技发展趋势。', '大16开', '210×140×38', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('木偶奇遇记', '卡洛·科洛迪', 'zh-CN', '9787020042531', '人民文学出版社', '2019-07-01', 320.00, 28.00, 220, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1148238.jpg', '《木偶奇遇记》讲述了一个木偶变成真正的男孩的故事。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('夏洛的网', 'E.B.怀特', 'zh-CN', '9787020042548', '人民文学出版社', '2019-08-01', 280.00, 25.00, 200, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1120437.jpg', '《夏洛的网》是一个关于友情的感人故事，讲述了一只蜘蛛和小猪的友谊。', '32开', '185×127×18', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('毛泽东传', '迪克·威尔逊', 'zh-CN', '9787108061126', '生活·读书·新知三联书店', '2019-07-01', 980.00, 88.00, 100, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1988991.jpg', '本书是一部权威的毛泽东传记，详细记述了毛泽东的一生。', '大32开', '210×140×52', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('拿破仑传', '埃米尔·路德维希', 'zh-CN', '9787108061133', '生活·读书·新知三联书店', '2019-08-01', 860.00, 78.00, 90, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1988393.jpg', '本书详细记述了拿破仑的一生，展现了这位军事天才的传奇人生。', '大32开', '210×140×48', 1);

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('庄子', '庄子', 'zh-CN', '9787101003116', '中华书局', '2019-11-01', 420.00, 36.00, 150, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1988693.jpg', '《庄子》是道家重要经典，以寓言故事阐述哲理，对后世文学产生深远影响。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('左传', '左丘明', 'zh-CN', '9787101003123', '中华书局', '2019-12-01', 980.00, 88.00, 120, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1319203.jpg', '《左传》是我国第一部叙事详细的编年史著作，记载了春秋时期的历史。', '32开', '185×127×58', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('复活', '列夫·托尔斯泰', 'zh-CN', '9787020090082', '人民文学出版社', '2019-11-01', 620.00, 48.00, 130, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s2064062.jpg', '《复活》是托尔斯泰晚年的代表作，描写了一个贵族青年的精神觉醒过程。', '32开', '185×127×35', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('悲惨世界', '维克多·雨果', 'zh-CN', '9787020090100', '人民文学出版社', '2019-12-01', 1280.00, 88.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s2241708.jpg', '《悲惨世界》是一部宏大的社会历史小说，展现了19世纪法国社会的众生相。', '32开', '185×127×75', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('边城', '沈从文', 'zh-CN', '9787020090105', '人民文学出版社', '2020-01-01', 280.00, 25.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1595557.jpg', '《边城》是沈从文的代表作，描写了湘西地区的风土人情和爱情故事。', '32开', '185×127×18', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('骆驼祥子', '老舍', 'zh-CN', '9787020090112', '人民文学出版社', '2020-02-01', 320.00, 28.00, 180, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1146040.jpg', '《骆驼祥子》讲述了北京人力车夫祥子的悲惨遭遇。', '32开', '185×127×20', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('自私的基因', '理查德·道金斯', 'zh-CN', '9787535732330', '湖南科技出版社', '2020-01-01', 480.00, 58.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1314474.jpg', '《自私的基因》从进化论的角度解释了生命的本质和进化的原理。', '大16开', '210×140×28', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('宇宙的琴弦', '布莱恩·格林', 'zh-CN', '9787535732347', '湖南科技出版社', '2020-02-01', 520.00, 62.00, 120, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1436379.jpg', '《宇宙的琴弦》介绍了弦理论，探讨了宇宙的本质。', '大16开', '210×140×30', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('绿山墙的安妮', 'L.M.蒙格马利', 'zh-CN', '9787020042555', '人民文学出版社', '2020-01-01', 380.00, 32.00, 200, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1727290.jpg', '《绿山墙的安妮》讲述了一个充满想象力的孤女的成长故事。', '32开', '185×127×22', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('柳林风声', '肯尼斯·格雷厄姆', 'zh-CN', '9787020042562', '人民文学出版社', '2020-02-01', 320.00, 28.00, 180, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1147839.jpg', '《柳林风声》是一部经典的动物故事，描写了河岸动物们的温馨生活。', '32开', '185×127×20', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('富兰克林自传', '本杰明·富兰克林', 'zh-CN', '9787108061140', '生活·读书·新知三联书店', '2020-01-01', 420.00, 42.00, 150, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1076890.jpg', '《富兰克林自传》记录了美国开国元勋富兰克林的人生经历和处世哲学。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('艾伦·图灵传', '安德鲁·霍奇斯', 'zh-CN', '9787108061157', '生活·读书·新知三联书店', '2020-02-01', 580.00, 58.00, 120, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s28033372.jpg', '本书详细记述了计算机科学之父图灵的传奇人生。', '大32开', '210×140×32', 1);

-- 注意：实际使用时需要插入更多数据
-- 这里只展示了两条示例数据的结构
-- 完整的100条数据插入语句可以参考这个格式继续添加 

-- 继续插入更多数据
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('百年孤独', '加西亚·马尔克斯', 'zh-CN', '9787020090129', '南海出版公司', '2020-03-01', 520.00, 55.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg', '《百年孤独》是魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的故事。', '32开', '185×127×32', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('变形记', '弗兰茨·卡夫卡', 'zh-CN', '9787020090136', '译林出版社', '2020-03-15', 280.00, 28.00, 180, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s4512594.jpg', '《变形记》是卡夫卡的代表作，讲述了一个推销员变成甲虫的荒诞故事。', '32开', '185×127×18', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('茶馆', '老舍', 'zh-CN', '9787020090143', '人民文学出版社', '2020-04-01', 320.00, 32.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1076836.jpg', '《茶馆》是老舍的代表作之一，通过一家茶馆的变迁展现了近代中国社会的变革。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('城南旧事', '林海音', 'zh-CN', '9787020090150', '中国青年出版社', '2020-04-15', 280.00, 25.00, 220, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1067911.jpg', '《城南旧事》以儿童的视角描写了老北京的生活，充满温情。', '32开', '185×127×18', 1);

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('世说新语', '刘义庆', 'zh-CN', '9787101003130', '中华书局', '2020-05-01', 420.00, 36.00, 150, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1451125.jpg', '《世说新语》记录了魏晋名士的言行，是研究魏晋时期社会生活的重要文献。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('文心雕龙', '刘勰', 'zh-CN', '9787101003147', '中华书局', '2020-05-15', 480.00, 42.00, 120, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1967580.jpg', '《文心雕龙》是中国古代最重要的文学理论著作之一。', '32开', '185×127×28', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('1984', '乔治·奥威尔', 'zh-CN', '9787020090167', '上海译文出版社', '2020-05-01', 420.00, 38.00, 180, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s4371408.jpg', '《1984》是一部反乌托邦小说，描绘了一个极权主义社会。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('动物农场', '乔治·奥威尔', 'zh-CN', '9787020090174', '上海译文出版社', '2020-05-15', 280.00, 25.00, 200, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s2347590.jpg', '《动物农场》是一部政治寓言小说，讽刺了极权主义社会。', '32开', '185×127×18', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('呐喊', '鲁迅', 'zh-CN', '9787020090181', '人民文学出版社', '2020-06-01', 320.00, 28.00, 220, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s27836262.jpg', '《呐喊》是鲁迅的第一部小说集，收录了《狂人日记》等名作。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('彷徨', '鲁迅', 'zh-CN', '9787020090198', '人民文学出版社', '2020-06-15', 320.00, 28.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s27836263.jpg', '《彷徨》是鲁迅的第二部小说集，收录了《祝福》等作品。', '32开', '185×127×20', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('上帝掷骰子吗', '曹天元', 'zh-CN', '9787535732354', '湖南科技出版社', '2020-06-01', 480.00, 45.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1486674.jpg', '《上帝掷骰子吗》介绍了量子力学的发展历程。', '大16开', '210×140×28', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('果壳中的宇宙', '史蒂芬·霍金', 'zh-CN', '9787535732361', '湖南科技出版社', '2020-06-15', 420.00, 42.00, 180, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1914861.jpg', '《果壳中的宇宙》探讨了宇宙的本质和人类的未来。', '大16开', '210×140×25', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('窗边的小豆豆', '黑柳彻子', 'zh-CN', '9787020042579', '南海出版公司', '2020-06-01', 280.00, 25.00, 250, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1067911.jpg', '《窗边的小豆豆》讲述了作者在小学时的温馨故事。', '32开', '185×127×18', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('海底两万里', '儒勒·凡尔纳', 'zh-CN', '9787020042586', '译林出版社', '2020-06-15', 480.00, 35.00, 180, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1817666.jpg', '《海底两万里》是一部经典的科幻冒险小说。', '32开', '185×127×28', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('史记', '司马迁', 'zh-CN', '9787108061164', '中华书局', '2020-06-01', 2800.00, 298.00, 80, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1953384.jpg', '《史记》是中国第一部纪传体通史，记录了上至黄帝、下至汉武帝的历史。', '大32开', '210×140×150', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('明朝那些事儿（全套）', '当年明月', 'zh-CN', '9787108061171', '中国海关出版社', '2020-06-15', 3200.00, 268.00, 100, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s2157335.jpg', '《明朝那些事儿》以通俗的语言讲述了明朝的历史。', '32开', '185×127×180', 1);

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('诗经', '佚名', 'zh-CN', '9787101003154', '中华书局', '2020-07-01', 520.00, 48.00, 120, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1557673.jpg', '《诗经》是中国最早的诗歌总集，收录了从西周初年到春秋中叶的诗歌。', '32开', '185×127×30', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('楚辞', '屈原等', 'zh-CN', '9787101003161', '中华书局', '2020-07-15', 480.00, 45.00, 100, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1076034.jpg', '《楚辞》是中国浪漫主义文学的源头，以屈原作品为主。', '32开', '185×127×28', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('罪与罚', '陀思妥耶夫斯基', 'zh-CN', '9787020090204', '上海译文出版社', '2020-07-01', 680.00, 58.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1790246.jpg', '《罪与罚》是俄国文学巨匠陀思妥耶夫斯基的代表作。', '32开', '185×127×38', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('战争与和平', '列夫·托尔斯泰', 'zh-CN', '9787020090211', '人民文学出版社', '2020-07-15', 1200.00, 98.00, 120, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1010340.jpg', '《战争与和平》是托尔斯泰的不朽名作，描写了拿破仑战争时期的俄国社会。', '32开', '185×127×65', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('平凡的世界', '路遥', 'zh-CN', '9787020090228', '人民文学出版社', '2020-07-01', 1500.00, 108.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1144911.jpg', '《平凡的世界》展现了中国普通人的生活图景。', '32开', '185×127×80', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('活着', '余华', 'zh-CN', '9787020090235', '作家出版社', '2020-07-15', 320.00, 28.00, 250, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s27279654.jpg', '《活着》讲述了一个人历经苦难但依然坚强活着的故事。', '32开', '185×127×20', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('时间简史', '史蒂芬·霍金', 'zh-CN', '9787535732378', '湖南科技出版社', '2020-07-01', 420.00, 45.00, 180, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1914710.jpg', '《时间简史》探讨了宇宙的起源和发展。', '大16开', '210×140×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('人类简史', '尤瓦尔·赫拉利', 'zh-CN', '9787535732385', '中信出版社', '2020-07-15', 680.00, 68.00, 200, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s27814883.jpg', '《人类简史》讲述了人类从古至今的发展历程。', '大16开', '210×140×38', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('小王子', '安托万·德·圣埃克苏佩里', 'zh-CN', '9787020042593', '人民文学出版社', '2020-07-01', 280.00, 22.00, 300, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1103152.jpg', '《小王子》是一部充满哲理的童话故事。', '32开', '185×127×18', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('夏洛的网', 'E.B.怀特', 'zh-CN', '9787020042609', '上海译文出版社', '2020-07-15', 320.00, 25.00, 250, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1120437.jpg', '《夏洛的网》讲述了一只蜘蛛与小猪的友情故事。', '32开', '185×127×20', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('曾国藩传', '张宏杰', 'zh-CN', '9787108061188', '生活·读书·新知三联书店', '2020-07-01', 680.00, 68.00, 150, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s3325163.jpg', '《曾国藩传》详细记录了曾国藩的一生。', '32开', '185×127×38', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('拿破仑传', '埃米尔·路德维希', 'zh-CN', '9787108061195', '中国社会科学出版社', '2020-07-15', 720.00, 78.00, 120, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1988393.jpg', '《拿破仑传》全面展现了拿破仑的一生。', '32开', '185×127×40', 1);

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('红楼梦', '曹雪芹', 'zh-CN', '9787101003178', '人民文学出版社', '2020-08-01', 1200.00, 98.00, 150, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1070959.jpg', '《红楼梦》是中国古典四大名著之首，描写了贾府的兴衰。', '32开', '185×127×65', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('三国演义', '罗贯中', 'zh-CN', '9787101003185', '人民文学出版社', '2020-08-15', 980.00, 88.00, 180, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1076932.jpg', '《三国演义》是中国第一部长篇章回体历史演义小说。', '32开', '185×127×55', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('安娜·卡列尼娜', '列夫·托尔斯泰', 'zh-CN', '9787020090242', '上海译文出版社', '2020-08-01', 820.00, 68.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1314205.jpg', '《安娜·卡列尼娜》是托尔斯泰笔下最完美的女性形象。', '32开', '185×127×45', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('简·爱', '夏洛蒂·勃朗特', 'zh-CN', '9787020090259', '人民文学出版社', '2020-08-15', 420.00, 35.00, 200, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s5924326.jpg', '《简·爱》是一部经典的爱情小说。', '32开', '185×127×25', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('围城', '钱钟书', 'zh-CN', '9787020090266', '人民文学出版社', '2020-08-01', 420.00, 39.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg', '《围城》是一部讽刺小说，描写了知识分子的婚姻生活。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('红高粱家族', '莫言', 'zh-CN', '9787020090273', '浙江文艺出版社', '2020-08-15', 480.00, 45.00, 180, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1305481.jpg', '《红高粱家族》展现了高密东北乡的传奇故事。', '32开', '185×127×28', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('未来简史', '尤瓦尔·赫拉利', 'zh-CN', '9787535732392', '中信出版社', '2020-08-01', 680.00, 68.00, 180, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s29287103.jpg', '《未来简史》探讨了人类的未来发展方向。', '大16开', '210×140×38', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('万物简史', '比尔·布莱森', 'zh-CN', '9787535732408', '中信出版社', '2020-08-15', 720.00, 72.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1137163.jpg', '《万物简史》介绍了从宇宙大爆炸到人类文明的历程。', '大16开', '210×140×40', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('安徒生童话', '安徒生', 'zh-CN', '9787020042616', '人民文学出版社', '2020-08-01', 420.00, 32.00, 250, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1034062.jpg', '《安徒生童话》收录了安徒生创作的经典童话故事。', '32开', '185×127×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('格林童话', '格林兄弟', 'zh-CN', '9787020042623', '人民文学出版社', '2020-08-15', 480.00, 35.00, 220, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1043975.jpg', '《格林童话》是世界上最著名的童话集之一。', '32开', '185×127×28', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('毛泽东传', '迪克·威尔逊', 'zh-CN', '9787108061201', '生活·读书·新知三联书店', '2020-08-01', 980.00, 88.00, 120, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1988991.jpg', '《毛泽东传》是一部权威的毛泽东传记。', '32开', '185×127×55', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('蒋介石传', '杨天石', 'zh-CN', '9787108061218', '生活·读书·新知三联书店', '2020-08-15', 880.00, 82.00, 100, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s4179545.jpg', '《蒋介石传》全面记录了蒋介石的一生。', '32开', '185×127×50', 1); 

-- 继续插入中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('水浒传', '施耐庵', 'zh-CN', '9787101003192', '人民文学出版社', '2020-09-01', 1100.00, 92.00, 160, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1436519.jpg', '《水浒传》是中国古典四大名著之一，描写了108位好汉的故事。', '32开', '185×127×60', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('西游记', '吴承恩', 'zh-CN', '9787101003208', '人民文学出版社', '2020-09-15', 980.00, 88.00, 180, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1627374.jpg', '《西游记》是中国古典四大名著之一，讲述了师徒四人西天取经的故事。', '32开', '185×127×55', 1);

-- 继续插入国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('飘', '玛格丽特·米切尔', 'zh-CN', '9787020090280', '译林出版社', '2020-09-01', 980.00, 88.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1078958.jpg', '《飘》是一部描写美国南北战争时期的爱情小说。', '32开', '185×127×55', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('老人与海', '海明威', 'zh-CN', '9787020090297', '上海译文出版社', '2020-09-15', 280.00, 25.00, 220, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1050021.jpg', '《老人与海》是海明威的代表作，讲述了一个老渔夫的故事。', '32开', '185×127×18', 1);

-- 继续插入人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('白鹿原', '陈忠实', 'zh-CN', '9787020090303', '人民文学出版社', '2020-09-01', 720.00, 59.00, 180, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s9137567.jpg', '《白鹿原》是一部展现陕西关中地区百年变迁的长篇小说。', '32开', '185×127×40', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('棋王', '阿城', 'zh-CN', '9787020090310', '人民文学出版社', '2020-09-15', 280.00, 25.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1070937.jpg', '《棋王》是阿城的代表作，讲述了一个天才棋手的故事。', '32开', '185×127×18', 1);

-- 继续插入科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('从一到无穷大', '乔治·伽莫夫', 'zh-CN', '9787535732415', '科学出版社', '2020-09-01', 420.00, 42.00, 180, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s2516920.jpg', '《从一到无穷大》介绍了数学和物理学的基本概念。', '大16开', '210×140×25', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('失控', '凯文·凯利', 'zh-CN', '9787535732422', '新星出版社', '2020-09-15', 820.00, 88.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s4554820.jpg', '《失控》探讨了技术与生物进化的关系。', '大16开', '210×140×45', 1);

-- 继续插入儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('木偶奇遇记', '卡洛·科洛迪', 'zh-CN', '9787020042630', '人民文学出版社', '2020-09-01', 320.00, 28.00, 250, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1148238.jpg', '《木偶奇遇记》讲述了一个木偶变成真正的男孩的故事。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('爱丽丝漫游奇境记', '刘易斯·卡罗尔', 'zh-CN', '9787020042647', '人民文学出版社', '2020-09-15', 320.00, 28.00, 220, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1070937.jpg', '《爱丽丝漫游奇境记》是一部充满想象力的儿童文学作品。', '32开', '185×127×20', 1);

-- 继续插入历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('艾伦·图灵传', '安德鲁·霍奇斯', 'zh-CN', '9787108061225', '浙江人民出版社', '2020-09-01', 580.00, 58.00, 150, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s28033372.jpg', '《艾伦·图灵传》记录了计算机科学之父图灵的一生。', '32开', '185×127×32', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('居里夫人传', '伊芙·居里', 'zh-CN', '9787108061232', '人民文学出版社', '2020-09-15', 480.00, 48.00, 180, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s1557672.jpg', '《居里夫人传》由居里夫人的女儿撰写，记录了这位杰出女科学家的一生。', '32开', '185×127×28', 1); 

-- 最后一批中国古典文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('聊斋志异', '蒲松龄', 'zh-CN', '9787101003215', '人民文学出版社', '2020-10-01', 680.00, 58.00, 150, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1070959.jpg', '《聊斋志异》是一部文言短篇小说集，多描写神鬼狐妖的故事。', '32开', '185×127×38', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('儒林外史', '吴敬梓', 'zh-CN', '9787101003222', '人民文学出版社', '2020-10-15', 580.00, 48.00, 180, (SELECT id FROM book_categories WHERE name = '中国古典文学'), 'https://img2.doubanio.com/view/subject/l/public/s1066143.jpg', '《儒林外史》是一部讽刺小说，描写了封建社会科举制度下的文人百态。', '32开', '185×127×32', 1);

-- 最后一批国外名著
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('巴黎圣母院', '维克多·雨果', 'zh-CN', '9787020090327', '人民文学出版社', '2020-10-01', 720.00, 58.00, 180, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1148102.jpg', '《巴黎圣母院》是雨果的代表作之一，以中世纪巴黎为背景。', '32开', '185×127×40', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('基督山伯爵', '大仲马', 'zh-CN', '9787020090334', '上海译文出版社', '2020-10-15', 980.00, 88.00, 150, (SELECT id FROM book_categories WHERE name = '国外名著'), 'https://img2.doubanio.com/view/subject/l/public/s1098533.jpg', '《基督山伯爵》是一部复仇与宽恕的故事。', '32开', '185×127×55', 1);

-- 最后一批人生文学
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('许三观卖血记', '余华', 'zh-CN', '9787020090341', '作家出版社', '2020-10-01', 380.00, 35.00, 200, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1074291.jpg', '《许三观卖血记》讲述了一个普通中国人的生存故事。', '32开', '185×127×22', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('黄金时代', '王小波', 'zh-CN', '9787020090358', '花城出版社', '2020-10-15', 320.00, 32.00, 220, (SELECT id FROM book_categories WHERE name = '人生文学'), 'https://img2.doubanio.com/view/subject/l/public/s1076372.jpg', '《黄金时代》是王小波最著名的作品之一。', '32开', '185×127×20', 1);

-- 最后一批科普读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('枪炮、病菌与钢铁', '贾雷德·戴蒙德', 'zh-CN', '9787535732439', '中信出版社', '2020-10-01', 720.00, 68.00, 150, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s1738643.jpg', '《枪炮、病菌与钢铁》探讨了人类社会的发展历程。', '大16开', '210×140×40', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('浪潮之巅', '吴军', 'zh-CN', '9787535732446', '人民邮电出版社', '2020-10-15', 680.00, 68.00, 180, (SELECT id FROM book_categories WHERE name = '科普读物'), 'https://img2.doubanio.com/view/subject/l/public/s6807265.jpg', '《浪潮之巅》记录了IT产业的发展史。', '大16开', '210×140×38', 1);

-- 最后一批儿童读物
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('彼得·潘', '詹姆斯·巴里', 'zh-CN', '9787020042654', '人民文学出版社', '2020-10-01', 320.00, 28.00, 250, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1147839.jpg', '《彼得·潘》讲述了永远不想长大的男孩的故事。', '32开', '185×127×20', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('柳林中的风声', '肯尼斯·格雷厄姆', 'zh-CN', '9787020042661', '人民文学出版社', '2020-10-15', 320.00, 28.00, 220, (SELECT id FROM book_categories WHERE name = '儿童读物'), 'https://img2.doubanio.com/view/subject/l/public/s1147840.jpg', '《柳林中的风声》是一部经典的儿童文学作品。', '32开', '185×127×20', 1);

-- 最后一批历史传记
INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('钱学森传', '张纯如', 'zh-CN', '9787108061249', '生活·读书·新知三联书店', '2020-10-01', 580.00, 58.00, 150, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s3745038.jpg', '《钱学森传》记录了中国航天之父钱学森的一生。', '32开', '185×127×32', 1);

INSERT INTO `books` (`title`, `author`, `language`, `isbn`, `publisher`, `publish_date`, `weight`, `price`, `stock`, `category_id`, `cover_image`, `description`, `format`, `dimensions`, `status`) VALUES ('爱因斯坦传', '沃尔特·艾萨克森', 'zh-CN', '9787108061256', '生活·读书·新知三联书店', '2020-10-15', 820.00, 78.00, 120, (SELECT id FROM book_categories WHERE name = '历史传记'), 'https://img2.doubanio.com/view/subject/l/public/s3356051.jpg', '《爱因斯坦传》全面记录了这位物理学大师的一生。', '32开', '185×127×45', 1);