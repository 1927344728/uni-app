import { COS_ASSET_PATH } from '@/utils/variables.js'

const musicBasePath = `${COS_ASSET_PATH}audio/music/`

export const MUSIC_MENU_LIST = [
  {
    id: 1,
    icon: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
    title: '一兆精选',
    desc: '聆听・尽享心灵盛宴',
  },
  {
    id: 2,
    icon: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
    title: '每日推荐',
    desc: '精彩・从音乐开始',
  },
  {
    id: 3,
    icon: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
    title: '跑步动感',
    desc: '热汗・让脂肪燃烧',
  },
  {
      
    id: 4,
    icon: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
    title: '兮小宝睡眠',
    desc: '空冥・自然纯音乐'
  }
]

export const MUSIC_LIST = [
    {
      id: 'audioT01NO1',
      menuId: 1,
      title: '浮光',
      artist: '周深',
      desc: '一半烟火热烈，一半嗓音清冷',
      url: `${musicBasePath}%E5%91%A8%E6%B7%B1-%E6%B5%AE%E5%85%89.mp3`,
      cover: 'https://photo-static-api.fotomore.com/creative/vcg/veer/612/veer-496590619.jpg',
      lyric: ''
    },
    {
      id: 'audioT01NO2',
      menuId: 1,
      title: '风知道我的倾诉 (女声版)',
      artist: '暄妍野野',
      desc: '一半烟火热烈，一半嗓音清冷',
      url: `${musicBasePath}%E6%9A%84%E5%A6%8D%E9%87%8E%E9%87%8E-%E9%A3%8E%E7%9F%A5%E9%81%93%E6%88%91%E7%9A%84%E5%80%BE%E8%AF%89%20%28%E5%A5%B3%E5%A3%B0%E7%89%88%29.mp3`,
      cover: `${COS_ASSET_PATH}images/1747122914-876553-1.jpg`,
      lyric: `${musicBasePath}%E6%9A%84%E5%A6%8D%E9%87%8E%E9%87%8E-%E9%A3%8E%E7%9F%A5%E9%81%93%E6%88%91%E7%9A%84%E5%80%BE%E8%AF%89%20%28%E5%A5%B3%E5%A3%B0%E7%89%88%29.lrc`
    },
    {
      id: 'audioT02NO1',
      menuId: 2,
      title: '百万个吻（可爱女声） (cover： 陈明真).mp3',
      artist: '甜醉儿',
      desc: '',
      url: `${musicBasePath}%E7%94%9C%E9%86%89%E5%84%BF-%E7%99%BE%E4%B8%87%E4%B8%AA%E5%90%BB%EF%BC%88%E5%8F%AF%E7%88%B1%E5%A5%B3%E5%A3%B0%EF%BC%89%20%28cover%EF%BC%9A%20%E9%99%88%E6%98%8E%E7%9C%9F%29.mp3`,
      cover: `${musicBasePath}images/ab831ee98dc541548f44c5328737f3d74cef25e81b444-T3mmJR_fw1200webp.webp`,
      lyric: `${musicBasePath}%E7%94%9C%E9%86%89%E5%84%BF-%E7%99%BE%E4%B8%87%E4%B8%AA%E5%90%BB%EF%BC%88%E5%8F%AF%E7%88%B1%E5%A5%B3%E5%A3%B0%EF%BC%89%20%28cover%EF%BC%9A%20%E9%99%88%E6%98%8E%E7%9C%9F%29.lrc`
    },
    {
      id: 'audioT00NO1',
      menuId: null,
      title: '午夜复古 Disco',
      artist: '',
      desc: '霓虹灯下的复古派对',
      url: ``,
      cover: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
      lyric: ''
    }
  ]