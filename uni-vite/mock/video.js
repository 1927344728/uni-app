import { get as _get, cloneDeep } from 'lodash'
import { VIDEO_MENU_LIST, VIDEO_LIST } from '/localdata/video.js'
import { initResponseData } from './common'

const videoList = cloneDeep(VIDEO_LIST).map(e => {
  e.id = String(e.id)
  e.type = String(e.type) ? String(e.type).split(',') : []
  return e
})

const getVideoMenuList = () => {
  const data = initResponseData()
  data.data = cloneDeep(VIDEO_MENU_LIST)
  return data
}

const getVideoPageList = (params) => {
  const { keyword, type, pageNum, pageSize } = params
  let list = cloneDeep(videoList)
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword) || item.desc.includes(keyword))
  }
  if (type) {
    list = list.filter(item => item.type.includes(String(type)))
  }
  list = list
    .splice(pageNum * pageSize, pageSize)
    .map(e => {
      e.id = Number(e.id)
      e.type = Array.isArray(e.type) ? e.type.join(',') : e.type
      return e
    })

  const data = initResponseData()
  data.data = list
  return data
}

const getVideoById = (params) => {
  const id = _get(params, 'id')
  const data = initResponseData()
  data.data = VIDEO_LIST.find(item => String(item.id) === String(id)) || null;
  return data
}

const getVideoByIds = (params) => {
  const ids = (params.ids || []).map(id => String(id))
  const list = VIDEO_LIST
    .filter(item => ids.includes(String(item.id)))
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  const data = initResponseData()
  data.data = list
  return data
}

const getVideoByRandom = (params) => {
  let { type, playingIds, playedIds } = params || {}
  type = type ? String(type) : ''
  playingIds = (playingIds || []).map(id => String(id))
  playedIds = (playedIds || []).map(id => String(id))
  
  let list = cloneDeep(videoList)
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

  const data = initResponseData()
  data.data = VIDEO_LIST.find(e => String(e.id) === songId)
  return data
}

export default {
  'api/video/getVideoMenuList': getVideoMenuList,
  'api/video/getVideoPageList': getVideoPageList,
  'api/video/getVideoById': getVideoById,
  'api/video/getVideoByIds': getVideoByIds,
  'api/video/getVideoByRandom': getVideoByRandom
}