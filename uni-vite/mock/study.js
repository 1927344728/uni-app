import { get as _get, cloneDeep } from "lodash"
import { CHINESE_WORD_LIST } from "/localdata/chinese_word.js"
import { initResponseData } from './common'

const getChineseWordList = (params) => {
  const { pageNum = 0, pageSize = 10 } = params
  const id = Number(params.id)
  let list = cloneDeep(CHINESE_WORD_LIST)
  if (id) {
    list = list.filter(item => item.id === id)
  }

  list = list.splice(pageNum * pageSize, pageSize)
  const data = initResponseData()
  data.data = {
    content: list,
  }
  return data
}

export default {
  'api/study/getChineseWordList': getChineseWordList
}