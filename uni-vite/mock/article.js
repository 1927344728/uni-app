import { get as _get, cloneDeep } from "lodash"
import { ARTICLE_LIST, ARTICLE_DETAIL_LIST } from "/localdata/article.js"
import { initResponseData } from './common'

const getArticlePageList = (params) => {
  const { keyword, type, subType, pageNum = 0, pageSize = 10 } = params
  let list = cloneDeep(ARTICLE_LIST)
  if (keyword) {
    list = list.filter(item => {
      return _get(item, 'title', '').includes(keyword)
    })
  }
  if (type) {
    list = list.filter(item => (item.type || '').split(',').filter(Boolean).includes(String(type)))
  }
  if (subType) {
    list = list.filter(item => !item.subType || item.subType === subType)
  }
  list = list.splice(pageNum * pageSize, pageSize)
  const data = initResponseData()

  data.data = {
		content: list,
	}
  return data
}

const getArticleById = (params) => {
  const { id } = params
  const data = initResponseData()
  data.data = ARTICLE_DETAIL_LIST.find(e => String(e.id) === String(id))
  return data
}

export default {
  'api/article/getArticlePageList': getArticlePageList,
  'api/article/getArticleById': getArticleById
}