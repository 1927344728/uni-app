import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { ARTICLE_LIST } from "@/pages/article/constant"
import { basicTemplate } from './common'

const getArticlePageList = (params) => {
  const { pageNum, pageSize } = params
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(ARTICLE_LIST).splice(pageNum * pageSize, pageSize)
  return Mock.mock(data);
}

const getArticleById = (params) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = ARTICLE_LIST.find(e => e.id === id)
  return Mock.mock(data);
}

export default {
  'api/article/getArticlePageList': getArticlePageList,
  'api/article/getArticleById': getArticleById
}