import { get as _get, cloneDeep } from 'lodash'
import { VIDEO_MENU_LIST, VIDEO_LIST } from '/database/video.js'
import { basicTemplate } from './common'

const getVideoMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(VIDEO_MENU_LIST)
  return data
}

const getVideoPageList = (params) => {
  const { keyword, type, pageNum, pageSize } = params
  let list = cloneDeep(VIDEO_LIST)
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword) || item.desc.includes(keyword))
  }
  list = list.filter(item => !type || item.type.split(',').includes(String(type)))
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return data
}

const getVideoById = (params) => {
  const id = _get(params, 'id')
  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.find(item => String(item.id) === String(id)) || null;
  return data
}

const getVideoByRandom = (params) => {
  let { type, playingIds, playedIds } = params || {}
  type = type ? String(type) : ''
  playingIds = (playingIds || []).map(id => String(id))
  playedIds = (playedIds || []).map(id => String(id))
  
  let list = cloneDeep(VIDEO_LIST).map(e => {
    e.id = String(e.id)
    e.type = e.type ? String(e.type).split(',') : []
    return e
  })
  if (type) {
    list = list.filter(item => item.type.includes(type))
  }
  if (playingIds.length) {
    list = list.filter(e => !playingIds.includes(e.id))
  }
  
  const allIds = list.map(e => e.id)
  let unplayedIds = []
  if (playedIds.length) {
    unplayedIds = allIds.filter(id => !playedIds.includes(id))
  }
  unplayedIds = unplayedIds.length ? unplayedIds : allIds
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];

  const data = cloneDeep(basicTemplate)
  data.data = list.find(e => String(e.id) === songId) || null;
  return data
}

const getVideoListByType = (params) => {
  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.filter(item => String(item.type) === String(_get(params, 'type'))) || null;
  return data
}

export default {
  'api/video/getVideoMenuList': getVideoMenuList,
  'api/video/getVideoPageList': getVideoPageList,
  'api/video/getVideoById': getVideoById,
  'api/video/getVideoByRandom': getVideoByRandom,
  'api/video/getVideoListByType': getVideoListByType,
}