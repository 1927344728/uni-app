import ARTICLE_COURSE_LIST from './article_course'
import ARTICLE_POEM_LIST from './article_poem'
import ARTICLE_SCORE_LIST from './article_score'
import ARTICLE_ANA_LIST from './article_ana'
import ARTICLE_NORMAL_LIST from './article_normal'
import ARTICLE_READ_VIDEO_LIST from './article_read_video'
import ARTICLE_TRAVEL from './article_travel'
import ARTICLE_CULTURE from './article_culture'

const ARTICLE_OTHER = [
  {
    id: 5,
    uuid: '',
    type: '1,2',
    subType: 3,
    title: '汉语拼音发音学习',
    note: '点击任意拼音即可播放发音',
    seq: 99,
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117234041_35_2.jpg',
    url: '/static/hanyupinyin.html',
    jumpTo: 'webview'
  },
  {
    id: 53,
    uuid: '',
    type: '1,2',
    subType: 3,
    title: '听写链接生成器',
    note: '输入听写词语，一键生成听写链接',
    seq: 99,
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/ai-generated-8496132_1280.jpg',
    url: '/pages/study/gen-dictation/index',
    jumpTo: 'navigate'
  },
  {
    id: 54,
    uuid: '',
    type: '1,2',
    subType: 3,
    title: '听写小助手',
    note: '可指定听写词语，也可以从已有数据中随机生成',
    seq: 99,
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/ai-generated-8050032_1280.jpg',
    url: '/pages/study/dictation/index',
    jumpTo: 'navigate'
  },
  {
    id: 55,
    uuid: '',
    type: '1,2',
    subType: 3,
    title: '前后鼻韵母强化练习',
    note: '常见前后鼻韵母强化练习，可选择检测模式或结果模式',
    seq: 99,
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/animals-8651226_1280.jpg',
    url: '/pages/study/rhyme/index',
    jumpTo: 'navigate'
  },
  {
    id: 6,
    uuid: '',
    type: '2,7',
    subType: null,
    title: '中国地方特色水果图鉴',
    note: '每一方水土，都有其独特的甜蜜献礼。探索中国大地上风味各异的地方名果。',
    seq: 0,
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/9aa1951aeb5a45e186eeef1d6e39296d463b6f2911c6ff-SlTBw5_fw1200webp.webp',
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
    thumb: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/tBzDxA-yeF6XfLSfgXrQlQ.jpg',
    url: '/static/photography.html',
    jumpTo: 'webview'
  },
]

export const ARTICLE_DETAIL_LIST = [
  ARTICLE_OTHER,
  ARTICLE_COURSE_LIST,
  ARTICLE_READ_VIDEO_LIST,
  ARTICLE_POEM_LIST,
  ARTICLE_SCORE_LIST,
  ARTICLE_ANA_LIST,
  ARTICLE_NORMAL_LIST,
  ARTICLE_TRAVEL,
  ARTICLE_CULTURE
].flat()


export const ARTICLE_LIST = ARTICLE_DETAIL_LIST
  .map(e => ({
    id: e.id,
    uuid: e.uuid,
    type: e.type,
    subType: e.subType,
    title: e.title,
    note: e.note,
    seq: e.seq,
    className: e.className,
    thumb: e.thumb,
    url: e.url || `/pages/article/detail?id=${e.id}`,
    jumpTo: e.jumpTo || 'navigate'
  }))
  .sort((a, b) => b.seq - a.seq)
console.log(ARTICLE_LIST.map(e => e.id))

// const jsonString = JSON.stringify(ARTICLE_DETAIL_LIST
//   .map(e => {
//     delete e.uuid
//     e.content = e.content || null
// 		e.url = e.url || `/pages/article/detail?id=${e.id}`,
//     e.jumpTo = e.jumpTo || 'navigate'
//     return e
//   })
//   .sort((a, b) => a.id - b.id)
// )
// console.log(jsonString)