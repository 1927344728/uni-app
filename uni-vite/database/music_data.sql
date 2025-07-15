-- 插入示例数据
INSERT INTO `music` (`title`, `artist`, `album`, `release_date`, `genre`, `duration`, `language`, `copyright`, `file_format`, `file_size`, `play_count`, `rating`, `cover_image`, `lyrics`, `status`) VALUES
-- 周杰伦经典歌曲
('七里香', '周杰伦', '七里香', FROM_UNIXTIME(1091462400), '流行', 300, '中文', '杰威尔音乐', 'MP3', 8.5, 10000000, 4.9, 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17', '窗外的麻雀 在电线杆上多嘴\n你说这一句 很有夏天的感觉...', 1),
('晴天', '周杰伦', '叶惠美', FROM_UNIXTIME(1059580800), '流行', 269, '中文', '杰威尔音乐', 'MP3', 7.8, 9500000, 4.8, 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d', '故事的小黄花 从出生那年就飘着\n童年的荡秋千 随记忆一直晃到现在...', 1),
('告白气球', '周杰伦', '周杰伦的床边故事', FROM_UNIXTIME(1466726400), '流行', 215, '中文', '杰威尔音乐', 'MP3', 6.5, 8800000, 4.7, 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229', '塞纳河畔 左岸的咖啡\n我手一杯 品尝你的美...', 1),
('最伟大的作品', '周杰伦', '最伟大的作品', FROM_UNIXTIME(1657065600), '流行', 255, '中文', '杰威尔音乐', 'MP3', 7.2, 5500000, 4.6, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae', '最伟大的作品 不是肖邦莫札特\n而是天使般的她 最美的乐章...', 1),
('圣诞星', '周杰伦', 'Single', FROM_UNIXTIME(1703116800), '流行', 245, '中文', '杰威尔音乐', 'MP3', 6.8, 2800000, 4.5, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf', '圣诞老人在旅行 驯鹿在飞行\n我在等你回信 想念的心情...', 1),

-- 林俊杰经典歌曲
('江南', '林俊杰', '第二天堂', FROM_UNIXTIME(1086297600), '流行', 267, '中文', '华纳音乐', 'MP3', 7.4, 9200000, 4.8, 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6', '风到这里就是黏 黏住过客的思念\n雨到了这里缠成线...', 1),
('可惜没如果', '林俊杰', '新地球', FROM_UNIXTIME(1419523200), '流行', 291, '中文', '华纳音乐', 'MP3', 8.1, 8600000, 4.7, 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa', '可惜没如果 你我都没有\n时间都走过 爱情结果...', 1),
('她说', '林俊杰', '她说', FROM_UNIXTIME(1291737600), '流行', 320, '中文', '华纳音乐', 'MP3', 8.8, 7800000, 4.6, 'https://images.unsplash.com/photo-1485579149621-3123dd979885', '她说 你 是不是也很少唱情歌\n她说 你 是不是也很少笑...', 1),
('修炼爱情', '林俊杰', '因你而在', FROM_UNIXTIME(1363190400), '流行', 288, '中文', '华纳音乐', 'MP3', 7.9, 7200000, 4.5, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', '修炼爱情的悲欢 我们这些努力不简单\n快乐炼成泪水...', 1),
('交换余生', '林俊杰', 'Single', FROM_UNIXTIME(1594771200), '流行', 271, '中文', '华纳音乐', 'MP3', 7.3, 6500000, 4.6, 'https://images.unsplash.com/photo-1515552726023-7125c8d07fb3', '余生有你好不好 我们换一个方式生活\n细水长流...', 1),

-- 其他华语经典
('光年之外', '邓紫棋', '光年之外', FROM_UNIXTIME(1483056000), '流行', 235, '中文', '蜂鸟音乐', 'MP3', 6.7, 7100000, 4.7, 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', '距离不算什么 思念是光年之外\n我们的爱...', 1),
('泡沫', '邓紫棋', '18', FROM_UNIXTIME(1345478400), '流行', 259, '中文', '蜂鸟音乐', 'MP3', 7.1, 6800000, 4.6, 'https://images.unsplash.com/photo-1513279922550-250c2129b13a', '阳光下的泡沫 是彩色的 就像被骗的我...', 1),
('后来', '刘若英', '很爱很爱你', FROM_UNIXTIME(936115200), '流行', 282, '中文', '滚石唱片', 'MP3', 7.6, 6200000, 4.8, 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b', '后来 我总算学会了如何去爱\n可惜你早已远去...', 1),
('红豆', '王菲', '红豆', FROM_UNIXTIME(906393600), '流行', 252, '中文', '百代唱片', 'MP3', 6.9, 5900000, 4.7, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81', '还没好好的感受 雪花绽放的气候\n我们一起颤抖...', 1),
('暗香', '沙宝亮', '暗香', FROM_UNIXTIME(1100476800), '流行', 295, '中文', '海蝶音乐', 'MP3', 7.5, 5500000, 4.5, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946', '暗香浮动月黄昏 月色朦胧\n花影阑珊 花影阑珊...', 1),

-- 2023-2024热门歌曲
('乌梅子酱', '李荣浩', 'Free Soul', FROM_UNIXTIME(1669248000), '流行', 258, '中文', '华纳音乐', 'MP3', 7.2, 8900000, 4.8, 'https://images.unsplash.com/photo-1504898770365-14faca6a7320', '乌梅子酱 你不要忘\n永远都不要忘...', 1),
('瞬', '郑润泽', 'Single', FROM_UNIXTIME(1689811200), '流行', 240, '中文', '独立音乐人', 'MP3', 6.4, 4800000, 4.5, 'https://images.unsplash.com/photo-1485579149621-3123dd979885', '在这一瞬间 我想要永远\n时间停在这一刻...', 1),
('Ditto', 'NewJeans', 'NewJeans OMG', FROM_UNIXTIME(1672531200), 'K-Pop', 185, '韩语', 'HYBE', 'MP3', 5.8, 7500000, 4.7, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 'Stay in the middle\nLike you a little...', 1),
('Cupid', 'FIFTY FIFTY', 'The Beginning', FROM_UNIXTIME(1677196800), 'K-Pop', 175, '韩语', 'ATTRAKT', 'MP3', 5.5, 6900000, 4.6, 'https://images.unsplash.com/photo-1485579149621-3123dd979885', 'Cupid, wherever you are\nPlease come and find me...', 1),
('Cruel Summer', 'Taylor Swift', 'Lover', FROM_UNIXTIME(1566518400), '流行', 178, '英语', 'Republic Records', 'MP3', 5.9, 8200000, 4.8, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 'Fever dream high in the quiet of the night\nYou know that I caught it...', 1),

-- 经典英文歌曲
('My Heart Will Go On', 'Celine Dion', 'Let\'s Talk About Love', FROM_UNIXTIME(881510400), '流行', 280, '英语', 'Columbia Records', 'MP3', 7.8, 9800000, 4.9, 'https://images.unsplash.com/photo-1513279922550-250c2129b13a', 'Every night in my dreams\nI see you, I feel you...', 1),
('Yesterday', 'The Beatles', 'Help!', FROM_UNIXTIME(-141868800), '摇滚', 125, '英语', 'Parlophone', 'MP3', 4.5, 8500000, 4.9, 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b', 'Yesterday, all my troubles seemed so far away\nNow it looks as though they\'re here to stay...', 1),
('Hotel California', 'Eagles', 'Hotel California', FROM_UNIXTIME(225331200), '摇滚', 391, '英语', 'Asylum Records', 'MP3', 9.2, 8900000, 4.8, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81', 'On a dark desert highway\nCool wind in my hair...', 1),

-- 经典粤语歌曲
('海阔天空', 'Beyond', '海阔天空', FROM_UNIXTIME(739670400), '摇滚', 326, '粤语', '华纳音乐', 'MP3', 8.4, 7600000, 4.8, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946', '今天我 寒夜里看雪飘过\n怀着冷却了的心窝飘远方...', 1),
('喜欢你', '邓丽君', '甜蜜蜜', FROM_UNIXTIME(232905600), '流行', 203, '粤语', '宝丽金', 'MP3', 5.8, 6800000, 4.7, 'https://images.unsplash.com/photo-1504898770365-14faca6a7320', '我对你的感觉 就像写在纸上的诗\n总是那么清楚...', 1),
('月亮代表我的心', '邓丽君', '甜蜜蜜', FROM_UNIXTIME(232905600), '流行', 188, '国语', '宝丽金', 'MP3', 5.4, 6900000, 4.8, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae', '你问我爱你有多深\n我爱你有几分...', 1),

-- 经典日语歌曲
('天城越え', '石川さゆり', '天城越え', FROM_UNIXTIME(531158400), '演歌', 294, '日语', 'Columbia Japan', 'MP3', 7.7, 4800000, 4.5, 'https://images.unsplash.com/photo-1515552726023-7125c8d07fb3', '天城越えて 初めて会った\nあの人の面影が...', 1),
('TSUNAMI', 'Southern All Stars', 'TSUNAMI', FROM_UNIXTIME(948844800), '流行', 289, '日语', 'Victor Entertainment', 'MP3', 7.5, 5200000, 4.6, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', '見つめ合うと 素直におれなくて\nサヨナラは 言い出せない...', 1); 