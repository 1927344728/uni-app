export const BOOK_LIST = [
  {
    id: 'u0001',
    type: '1,2',
    title: '红楼梦（全二册）',
    author: '曹雪芹',
    owner: '李兆',
    score: 9.7,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg',
    description: '百科全书式的家族兴衰传奇，宝黛爱情与人间真情的终极写照。',
    tags: ['必读', '经典推荐', '一兆珍藏'],
    summary: '这是林语堂写给苏轼的一封长信。作者以风趣笔触串起苏轼的一生——从意气风发到屡遭贬谪，再到晚年豁达，展现一个自在、鲜活的苏东坡。',
    highlights: [
      '“人有悲欢离合，月有阴晴圆缺，此事古难全。”',
      '“竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。”',
      '“我本无家更安往，故乡无此好湖山。”'
    ]
  },
  {
    id: 'u0002',
    type: '1,2',
    title: '时间简史（插图本）',
    author: '史蒂芬·霍金',
    owner: '李兆',
    score: 9.4,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s1775746.jpg',
    description: '以极简语言讲述宇宙起源与命运，跨越时间的物理学入门。',
    tags: ['科普', '上新', '必读']
  },
  {
    id: 'u0003',
    type: '1,2',
    title: '小王子',
    author: '圣埃克苏佩里',
    owner: '何烨笼',
    score: 9.6,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s1103152.jpg',
    description: '献给长大成人的孩子，温柔讲述孤独、爱与责任。',
    tags: ['治愈', '闲置可借', '亲子']
  },
  {
    id: 'u0004',
    type: '1,2',
    title: '自私的基因',
    author: '理查德·道金斯',
    owner: '李兆',
    score: 9.1,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s1314474.jpg',
    description: '用基因视角重新理解生命与进化，是现代生物学思维的起点。',
    tags: ['思考', '推荐', '进化论']
  },
  {
    id: 'u0005',
    type: '1,2',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    owner: '李兆',
    score: 9.5,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg',
    description: '布恩迪亚家族七代人的孤独与宿命，魔幻现实主义巅峰。',
    tags: ['诺奖', '故事感', '必读']
  },
  {
    id: 'u0006',
    type: '1,2',
    title: '活着',
    author: '余华',
    owner: '李兆',
    score: 9.3,
    seq: 0,
    cover: 'https://img2.doubanio.com/view/subject/l/public/s27139411.jpg',
    description: '一个普通农民的悲欢人生，直面苦难与坚韧的生命礼赞。',
    tags: ['感动', '经典', '必读']
  }
].sort((a, b) => b.seq - a.seq)