export const BOOK_TYPE_ENUM = [
  { typeId: 1, name: '文化' },
  { typeId: 2, name: '学习教育' },
  { typeId: 3, name: '少儿读物' },
  { typeId: 4, name: '名著' },
  { typeId: 5, name: '典籍' },
  { typeId: 6, name: '文学' },
  { typeId: 7, name: '历史' },
  { typeId: 8, name: '天文地理' },
  { typeId: 10, name: '处世智慧' },
  { typeId: 15, name: '技术' },
  { typeId: 99, name: '其他' },
]

export const MUSIC_TYPE_ENUM = [
  { typeId: 1, name: '推荐' },
  { typeId: 2, name: '精选' },
  { typeId: 3, name: '珍藏' },
  { typeId: 4, name: '纯音乐' },
  { typeId: 5, name: '经典' },
  { typeId: 99, name: '其他' },
]

export const MUSIC_MENU_LIST = [
  {
    id: 1,
    icon: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/istockphoto-1065457848-2048x2048.jpg',
    title: '一兆精选',
    desc: '聆听・尽享心灵盛宴',
    songIds: [8, 16, 26, 27, 39, 43, 48, 53, 58, 59]
  },
  {
    id: 2,
    icon: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/9e78618c7b706367a35b6083f5ffca3ebf0267ab24e88-qNKi0w_fw1200webp.webp',
    title: '每日推荐',
    desc: '精彩・从音乐开始',
    songIds: [60, 61, 62, 63, 64, 65, 66, 68, 73, 76]
  },
  {
    id: 3,
    icon: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/b7772ad00a198917.jpg',
    title: '跑步动感',
    desc: '瀑汗・脂肪燃烧',
    songIds: [62, 56, 49, 41, 40, 28]
  },
  {
      
    id: 4,
    icon: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20251117231226_33_222.jpg',
    title: '兮小宝睡眠',
    desc: '空冥・纯音乐',
    songIds: [99, 96, 108, 102, 97, 85, 95, 100, 105, 92]
  }
]


export const VIDEO_TYPE_ENUM = [
  { typeId: 1, name: 'MV', desc: '视觉与听觉的盛宴' },
  { typeId: 2, name: '短视频', desc: '精彩瞬间速递' },
  { typeId: 3, name: '日常', desc: '日常生活精彩瞬间' },
  { typeId: 4, name: '其他', desc: '' },
]

export const VIDEO_MENU_LIST = [
  {
    id: 1,
    title: 'banner',
    desc: 'banner',
    videoIds: [7, 4, 1]
  },
  {
    id: 2,
    title: '推荐视频',
    desc: '推荐视频',
    videoIds: [8, 7, 5, 4, 6]
  },
]