import { get as _get, cloneDeep } from "lodash"
import { BOOK_LIST } from "/database/book.js"
import { basicTemplate } from './common'

const getBookPageList = (params) => {
  const { keyword, type, pageNum, pageSize } = params
  let list = cloneDeep(BOOK_LIST)
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword) || item.owner.includes(keyword))
  }
  if (type) {
    list = list.filter(item => (item.type || '').split(',').includes(String(type)))
  }
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return data
}

const getBookById = (params) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = BOOK_LIST.find(e => String(e.id) === String(id))
  return data
}

export default {
  'api/book/getBookPageList': getBookPageList,
  'api/book/getBookById': getBookById
}