import ARTICLE_COURSE_LIST from './article_course'
import ARTICLE_POEM_LIST from './article_poem'
import ARTICLE_SCORE_LIST from './article_score'
import ARTICLE_ANA_LIST from './article_ana'
import ARTICLE_NORMAL_LIST from './article_normal'
import ARTICLE_READ_VIDEO_LIST from './article_read_video'

export const ARTICLE_TYPE_ENUM = [
  {
    id: 1,
    name: '课程',
    children: [
      { id: 1, name: '语文（一年级）' }
    ]
  },
  {
    id: 2,
    name: '推荐',
    children: []
  },
  {
    id: 3,
    name: '阅读',
    children: [
      { id: 1, name: '亲子阅读' },
      { id: 2, name: '少儿诗词' },
      { id: 3, name: '口才训练' },
    ]
  },
  {
    id: 4,
    name: '成绩',
    children: []
  },
  {
    id: 5,
    name: '旅游',
    children: []
  },
  {
    id: 6,
    name: '轻摘',
    children: []
  },
  {
    id: 7,
    name: '文章',
    children: []
  },
  {
    id: 8,
    name: '图书馆',
    children: []
  },
  {
    id: 99,
    name: '其他',
    children: []
  }
]

export const ARTICLE_DETAIL_LIST = [].concat(
  ARTICLE_COURSE_LIST,
  ARTICLE_READ_VIDEO_LIST,
  ARTICLE_POEM_LIST,
  ARTICLE_SCORE_LIST,
  ARTICLE_ANA_LIST,
  ARTICLE_NORMAL_LIST
)

export const ARTICLE_LIST= [
  {
    id: 5,
    uuid: '',
    type: '1,2',
    subType: null,
    title: '汉语拼音发音学习',
    note: '点击任意拼音即可播放发音',
    seq: 99,
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117234041_35_2.jpg',
    // url: 'https://1927344728.github.io/web-page/hanyupinyin.html',
    url: '/static/hanyupinyin.html',
    jumpTo: 'webview'
  },
  {
    id: 6,
    uuid: '',
    type: '2,7',
    subType: null,
    title: '中国地方特色水果图鉴',
    note: '每一方水土，都有其独特的甜蜜献礼。探索中国大地上风味各异的地方名果。',
    seq: 0,
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/9aa1951aeb5a45e186eeef1d6e39296d463b6f2911c6ff-SlTBw5_fw1200webp.webp',
    url: '/static/fruit.html',
    jumpTo: 'webview'
  },
  {
    id: 7,
    uuid: '',
    type: '7',
    subType: null,
    title: '摄影笔记深度解析',
    note: '从原理到实践的摄影入门指南——深入解读宁思潇潇的经典之作',
    seq: 0,
    image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/tBzDxA-yeF6XfLSfgXrQlQ.jpg',
    url: '/static/photography.html',
    jumpTo: 'webview'
  },
]
  .concat(ARTICLE_DETAIL_LIST.map(e => ({
    id: e.id,
    uuid: e.uuid,
    type: e.type,
    subType: e.subType,
    title: e.title,
    note: e.note,
    seq: e.seq,
    className: e.className,
    image: e.image,
    url: `/pages/article/detail?id=${e.id}`,
    readCount: e.readCount || null,
    collectCount: e.collectCount || null,
    jumpTo: 'navigate'
  })))
  .sort((a, b) => b.seq - a.seq)