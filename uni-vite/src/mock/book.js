import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { BOOK_LIST } from "/database/book.js"
import { basicTemplate } from './common'

const getBookPageList = (params) => {
  const { type, pageNum, pageSize } = params
  let list = cloneDeep(BOOK_LIST)
  if (type) {
    list = list.filter(item => (item.type || '').split(',').includes(String(type)))
  }
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return Mock.mock(data);
}

const getBookById = (params) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = BOOK_LIST.find(e => e.id === id)
  return Mock.mock(data);
}

export default {
  'api/book/getBookPageList': getBookPageList,
  'api/book/getBookById': getBookById
}