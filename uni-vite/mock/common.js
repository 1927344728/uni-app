import { cloneDeep } from "lodash"
import { ARTICLE_LIST } from '/database/article.js'

export const basicTemplate = {
  code: 200,
  success: true,
  message: '请求成功',
  data: null
}

const helloWord = () => {
  const data = cloneDeep(basicTemplate)
  data.data = 'Hello, World!'
  return data
}

const getBannerList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = [
    {
      id: 1,
      title: '天空青草',
      type: 'image',
      image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117231227_34_2.jpg',
      url: '/pages/article/detail?id=1',
      seq: 0,
      jumpTo: 'navigate'
    },
    {
      id: 2,
      title: '图书馆',
      type: 'image',
      image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117231226_32_2.jpg',
      url: '/pages/video/play?mode=single&id=2',
      seq: 0,
      jumpTo: 'navigate'
    },
    {
      id: 3,
      title: '优雅聆听',
      type: 'image',
      image: 'https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/微信图片_20251117231226_33_2.jpg',
      url: '/static/hanyupinyin.html',
      seq: 0,
      jumpTo: 'webview'
    },
  ].sort((a, b) => b.seq - a.seq)
  return data
}

export default {
  'api/hello/helloWord': helloWord,
  'api/common/getBannerList': getBannerList
}