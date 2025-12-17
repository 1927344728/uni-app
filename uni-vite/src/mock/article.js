import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { ARTICLE_LIST, ARTICLE_DETAIL_LIST } from "/database/article.js"
import { basicTemplate } from './common'

const getArticlePageList = (params) => {
  const { type, pageNum, pageSize } = params
  let list = cloneDeep(ARTICLE_LIST)
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