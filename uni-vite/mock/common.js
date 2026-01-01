import { cloneDeep } from "lodash"

export const basicTemplate = {
  code: 200,
  success: true,
  message: '请求成功',
  data: null
}

const helloWord = () => {
  return {
    'data': ''
  }
}

const getUserInfo = () => {
  const data = cloneDeep(basicTemplate)
  data.data = {
    name: ''
  }
  return data
}

export default {
  'api/hello/helloWord': helloWord,
  'api/user/getUserInfo': getUserInfo
}