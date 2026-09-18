import { cloneDeep } from "lodash"
import { COS_DOMAIN_NAME } from '@/utils/variables.js'
import { CATEGORY_ENUM } from '/localdata/category.js'

export const initResponseData = () => ({
  code: 200,
  success: true,
  message: '请求成功',
  data: null
})

/** 与前后台查询接口一致：排序值递减、更新时间递减、id 递增 */
export const sortBySeqUpdatedId = (a, b) => {
  const seq = (Number(b.seq) || 0) - (Number(a.seq) || 0)
  if (seq !== 0) return seq
  const time = (Number(b.updatedTime) || 0) - (Number(a.updatedTime) || 0)
  if (time !== 0) return time
  return (Number(a.id) || 0) - (Number(b.id) || 0)
}

const helloWord = () => {
  const data = initResponseData()
  data.data = 'Hello, World!'
  return data
}

const getCategoryEnum = () => {
  const data = initResponseData()
  data.data = cloneDeep(CATEGORY_ENUM)
  return data 
}

const getBannerList = () => {
  const data = initResponseData()
  data.data = [
    {
      id: 1,
      title: '天空青草',
      type: 'image',
      image: `${COS_DOMAIN_NAME}/images/微信图片_20251117231227_34_2.jpg`,
      url: '/pages/article/detail?id=1',
      seq: 0,
      jumpTo: 'navigate'
    },
    {
      id: 2,
      title: '图书馆',
      type: 'image',
      image: `${COS_DOMAIN_NAME}/images/微信图片_20251117231226_32_2.jpg`,
      url: '/pages/video/play?mode=single&id=2',
      seq: 0,
      jumpTo: 'navigate'
    },
    {
      id: 3,
      title: '优雅聆听',
      type: 'image',
      image: `${COS_DOMAIN_NAME}/images/微信图片_20251117231226_33_2.jpg`,
      url: '/static/hanyupinyin.html',
      seq: 0,
      jumpTo: 'webview'
    },
  ].sort(sortBySeqUpdatedId)
  return data
}

export default {
  'api/hello/helloWord': helloWord,
  'api/common/getCategoryEnum': getCategoryEnum,
  'api/common/getBannerList': getBannerList
}