import { get as _get, cloneDeep } from "lodash"
import { BOOK_TYPE_ENUM, BOOK_LIST } from "/database/book.js"
import { basicTemplate } from './common'

const getBookTypeList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(BOOK_TYPE_ENUM)
  return data
}

const getBookPageList = (params) => {
  const { keyword, type, pageNum, pageSize } = params
  let list = cloneDeep(BOOK_LIST)
  if (type) {
    list = list.filter(item => (item.type || '').split(',').includes(String(type)))
  }
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword) || item.owner.includes(keyword))
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
  'api/book/getBookTypeList': getBookTypeList,
  'api/book/getBookPageList': getBookPageList,
  'api/book/getBookById': getBookById
}