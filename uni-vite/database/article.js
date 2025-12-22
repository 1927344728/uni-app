export const ARTICLE_TYPE_ENUM = {
  1: '课程',
  2: '推荐',
  3: '阅读',
  4: '成绩',
  5: '旅游',
  6: '文章',
  99: '其他'
}

export const ARTICLE_LIST= [
  {
    id: 'u00001',
    type: '1,2,3',
    title: '汉语拼音发音学习',
    note: '点击任意拼音即可播放发音',
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117234041_35_2.jpg?imageMogr2/thumbnail/160',
    // url: 'https://1927344728.github.io/web-page/hanyupinyin.html',
    url: '/static/hanyupinyin.html',
    readCount: 1200,
    collectCount: 200,
    jumpTo: 'webview'
  },
  {
    id: 'u00002',
    type: '2,3',
    title: '李若小画家绘画作品展',
    note: '你的每一幅画，都是送给这个世界的一份独特礼物！',
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003939_120_2.jpg?imageMogr2/thumbnail/750x',
    url: '/pages/article/detail?id=u00001',
    readCount: 1200,
    collectCount: 200,
    jumpTo: 'navigate'
  },
  {
    id: 'u00003',
    type: '2,6',
    title: '中国地方特色水果图鉴',
    note: '每一方水土，都有其独特的甜蜜献礼。探索中国大地上风味各异的地方名果。',
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/9aa1951aeb5a45e186eeef1d6e39296d463b6f2911c6ff-SlTBw5_fw1200webp.webp',
    url: '/static/fruit.html',
    readCount: 1800,
    collectCount: 142,
    jumpTo: 'webview'
  },
  {
    id: 'u00004',
    type: '5',
    title: '摄影笔记深度解析',
    note: '从原理到实践的摄影入门指南——深入解读宁思潇潇的经典之作',
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/tBzDxA-yeF6XfLSfgXrQlQ.jpg',
    url: '/static/photography.html',
    readCount: 1800,
    collectCount: 142,
    jumpTo: 'webview'
  },
  {
    id: 'u00005',
    type: '4',
    title: '李兮一年级上学期期中考试成绩单',
    note: '爸爸为你的努力感到骄傲，继续加油哦！',
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251217212113_130_2.jpg?imageMogr2/thumbnail/750x',
    url: '/pages/article/detail?id=u00002',
    readCount: null,
    collectCount: null,
    jumpTo: 'navigate'
  },
]

export const ARTICLE_DETAIL_LIST = [
  {
    id: 'u00001',
    title: '李若小画家绘画作品展',
    author: '李兆',
    content: [
      {
        type: 'text',
        content: '你好，李若！'
      },
      {
        type: 'richText',
        content: [
          '你画画时的样子就像一个小小的魔法师——眼睛亮晶晶的，小手稳稳的，能把白纸变成五彩斑斓的奇妙世界。<b style="color: #44ace2;">你的耐心比彩虹还要美丽，你的想象力比星星还要闪亮。</b>',
          '你知道吗？当别的孩子已经画完时，你还在认真地为小花朵添上露珠，为小恐龙画上微笑的翅膀，这种专注是最珍贵的魔法。你笔下的太阳会唱歌，云朵长着翅膀，大海里游着彩虹鱼……这些都不是随便谁都能想出来的，<b style="color: #44ace2;">这是独属于你的闪闪发光的创造力。</b>'
        ]
      },
      {
        type: 'image',
        content: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003935_117_2.jpg',
        description: '小雪人'
      },
      {
        type: 'image',
        content: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003937_119_2.jpg',
        description: '小鲸鱼'
      },
      {
        type: 'image',
        content: [
          'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003939_120_2.jpg',
          // 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003941_121_2.jpg',
          // 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003943_122_2.jpg',
          'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003945_123_2.jpg'
        ],
        description: '温暖的冬天'
      },
      {
        type: 'image',
        content: [
          'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251216003950_126_2.jpg'
        ],
        description: '小鱼儿'
      },
      {
        type: 'image',
        content: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251217212150_131_2.jpg',
        description: '冬至'
      },
      // {
      //   type: 'video',
      //   content: [
      //     'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/video/life/94805290ed6ad02dda8ec52773ddf2a7.mp4'
      //   ],
      //   poster: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/94805290ed6ad02dda8ec52773ddf2a7s.jpg',
      //   description: '手指歌'
      // },
      {
        type: 'richText',
        content: [
          '请继续这样画下去吧，用你的眼睛发现更多美好，用你的小手创造更多奇迹。画纸永远是你最好的朋友，它会忠实地保存你每一个天马行空的想法。老师和爸爸妈妈都期待着，看你用画笔继续讲述那些只有你知道的、藏在心里的小故事。',
          '<b style="color: #44ace2;">世界正是需要像你这样，既愿意耐心倾听，又敢于大胆创造的小小艺术家。</b> 你的每一幅画，都是送给这个世界的一份独特礼物！'
        ]
      },
    ]
  },
  {
    id: 'u00002',
    title: '李兮一年级上学期期中考试成绩单',
    author: '李兆',
    content: [
      { type: 'text', content: '亲爱的李兮：' },
      { type: 'text', content: '这是你在一年级上学期期中考试的成绩单。' },
      {
        type: 'image',
        content: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251217212023_129_2.jpg',
        description: '语文 88分'
      },
      {
        type: 'image',
        content: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251217212113_130_2.jpg',
        description: '数学 95分'
      },
      {
        type: 'text',
        content: '在这次考试中，你的数学取得了不错的成绩，而语文的成绩还有待提升，拼音的读写、识字阅读还需要多加练习。'
      },
      {
        type: 'richText',
        content: '还有，<span style="color: #44ace2;">你的字要写得漂亮一点哦。</span>漂亮的字，跟漂亮的兮小宝一样，大家都会喜欢的！'
      },
      {
        type: 'richText',
        content: '成绩只是对你学习情况的一个反映，更重要的是你在学习过程中所付出的努力和坚持。你每天都能认真完成作业，自己完成打卡任务，这些都是非常值得表扬的地方。<span style="color: #44ace2; font-weight: bold;">为你点赞！！！</span>'
      },
      {
        type: 'text',
        content: '学习可以让自己变得更加聪明和有能力。爸爸希望你继续保持这种积极学习的态度，勇于面对挑战，不断追求进步。'
      },
      { type: 'richText', content: '<b style="color: #44ace2;">爸爸为你的努力感到骄傲，继续加油哦！</b>' },
    ]
  }
]