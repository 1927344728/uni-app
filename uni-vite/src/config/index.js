import { WEB_DOMAIN, COS_ASSET_PATH } from '@/utils/variables'
export const LOGO_IMAGE = `${COS_ASSET_PATH}images/logo.png`
export const DEFAULT_AVATAR_IMAGE = `${COS_ASSET_PATH}images/default.png`


export const FEATURE_ICON_ENUM = [
  {
    key: 'task',
    name: '任务中心',
    image: `${COS_ASSET_PATH}images/d502c279bba37f3dfe78158803cfff37.jpg`,
    url: '/pages/task/index',
    jumpTo: 'navigate'
  },
  {
    key: 'book',
    name: '我的书单',
    image: `${COS_ASSET_PATH}images/d4f59adc3c18b9289aef1f340a93357e.jpg`,
    url: '/pages/study/book/index',
    jumpTo: 'navigate'
  },
  {
    key: 'audio',
    name: '音乐收藏',
    image: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
    url: '/pages/music/index',
    jumpTo: 'navigate'
  },
  {
    key: 'video',
    name: '视频订阅',
    image: `${COS_ASSET_PATH}images/147d5438ef903fcbbac27fc51b5627c8.jpg`,
    url: '/pages/video/index?menuId=1',
    jumpTo: 'navigate'
  },
]

export const FOOTER_BUTTON_LIST = [
  {
    key: 'index',
    name: '首页',
    icon: 'home',
    url: '/pages/index/index'
  },
  {
    key: 'task',
    name: '任务',
    icon: 'wallet',
    url: '/pages/task/index'
  },
  {
    key: 'study',
    name: '学习',
    icon: 'medal',
    url: '/pages/study/index'
  },
  {
    key: 'life',
    name: '生活',
    icon: 'gift',
    url: '/pages/life/index'
  },
  {
    key: 'me',
    name: '我',
    icon: 'person',
    url: '/pages/me/index'
  },
]