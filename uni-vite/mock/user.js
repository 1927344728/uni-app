import { cloneDeep } from "lodash"
import { initResponseData } from './common'

const getUserInfo = () => {
  const data = initResponseData()
  data.data = {
    name: '李兆',
    nickname: '一兆映雪',
    role: 2,
    phone_number: '15857185220'
  }
  data.data = null
  return data
}

export default {
  'api/user/getUserInfo': getUserInfo
}