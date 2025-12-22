import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { ARTICLE_LIST, ARTICLE_DETAIL_LIST } from "/database/article.js"
import { basicTemplate } from './common'

const getArticlePageList = (params) => {
  const { keyword, type, pageNum, pageSize } = params
  let list = cloneDeep(ARTICLE_LIST)
  if (keyword) {
    list = list.filter(item => {
      return _get(item, 'title', '').includes(keyword)
    })
  }
  if (type) {
    list = list.filter(item => (item.type || '').split(',').includes(String(type)))
  }
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return Mock.mock(data);
}

const getArticleById = (params) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = ARTICLE_DETAIL_LIST.find(e => e.id === id)
  return Mock.mock(data);
}

export default {
  'api/article/getArticlePageList': getArticlePageList,
  'api/article/getArticleById': getArticleById
}