import { get as _get, cloneDeep } from "lodash"
import { BOOK_LIST } from "/localdata/book.js"
import { initResponseData } from './common'

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
  const data = initResponseData()
  data.data = {
		content: list,
	}
  return data
}

const getBookById = (params) => {
  const { id } = params
  const data = initResponseData()
  data.data = BOOK_LIST.find(e => String(e.id) === String(id))
  return data
}

export default {
  'api/book/getBookPageList': getBookPageList,
  'api/book/getBookById': getBookById
}