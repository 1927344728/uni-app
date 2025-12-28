import { get as _get, cloneDeep } from 'lodash'
import Mock from 'mockjs'
import { VIDEO_MENU_LIST, VIDEO_LIST } from '/database/video.js'
import { basicTemplate } from './common'

const getVideoMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(VIDEO_MENU_LIST)
  return Mock.mock(data);
}

const getVideoPageList = (params) => {
  const { keyword, menuId, pageNum, pageSize } = params
  let list = cloneDeep(VIDEO_LIST)
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword) || item.desc.includes(keyword))
  }
  list = list.filter(item => !menuId || item.menuId.split(',').includes(String(menuId)))
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return Mock.mock(data);
}

const getVideoById = (params) => {
  const id = _get(params, 'id')
  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.find(item => item.id === String(id)) || null;
  return Mock.mock(data);
}

const getVideoByRandom = (params) => {
  const playingVideoIds = _get(params, 'playingVideoIds') || []
  const playedVideoIds = _get(params, 'playedVideoIds') || []
  
  const allIds = VIDEO_LIST.map(e => e.id).filter(id => !playingVideoIds.includes(id))
  let unplayedIds = allIds.filter(id => !playedVideoIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];

  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.find(e => e.id === songId) || null;

  return Mock.mock(data);
}

const getVideoListByMenuId = (params) => {
  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.filter(item => String(item.menuId) === String(_get(params, 'menuId'))) || null;
  return Mock.mock(data);
}

export default {
  'api/video/getVideoMenuList': getVideoMenuList,
  'api/video/getVideoPageList': getVideoPageList,
  'api/video/getVideoById': getVideoById,
  'api/video/getVideoByRandom': getVideoByRandom,
  'api/video/getVideoListByMenuId': getVideoListByMenuId,
}