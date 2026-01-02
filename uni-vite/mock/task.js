import { get as _get, cloneDeep } from "lodash"
import { TASK_LIST } from "/database/task.js"
import { basicTemplate } from './common'

const getTaskPageList = (params) => {
  const { title, status, targeter, pageNum, pageSize } = params
  const list = cloneDeep(TASK_LIST).filter(e => {
    const hasTitle = !title || e.title.includes(title)
    const hasStatus = !status || e.status === status
    const hasTargeter = !targeter || e.targeter.split(/[,，\s]/).includes(targeter)
    return hasTitle && hasStatus && hasTargeter
  })
  const data = cloneDeep(basicTemplate)
  data.data = list.splice(pageNum * pageSize, pageSize)
  return data
}

const getTaskById = (params) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = TASK_LIST.find(e => e.id === id)
  return data
}

const getTaskTargeterList = () => {
  const set = new Set()
  TASK_LIST.forEach(item => {
    if (item.targeter) {
      item.targeter.split(/[,，\s]/).forEach(name => {
      set.add(name)
      })
    }
  })

  const data = cloneDeep(basicTemplate)
  data.data = Array.from(set)
  return data
}

export default {
  'api/task/getTaskPageList': getTaskPageList,
  'api/task/getTaskById': getTaskById,
  'api/task/getTaskTargeterList': getTaskTargeterList
}