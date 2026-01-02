import { cloneDeep } from "lodash"
import { basicTemplate } from './common'

const getUserInfo = () => {
  const data = cloneDeep(basicTemplate)
  data.data = {
    name: '李兆',
    nickname: '一兆方圆',
    role: 2,
    phone_number: '15857185220'
  }
  data.data = null
  return data
}

export default {
  'api/user/getUserInfo': getUserInfo
}