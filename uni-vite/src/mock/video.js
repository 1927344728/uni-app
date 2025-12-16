import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { VIDEO_MENU_LIST, VIDEO_LIST } from "@/pages/video/constant"
import { basicTemplate } from './common'

const getVideoMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(VIDEO_MENU_LIST)
  return Mock.mock(data);
}

const getVideoPageList = (params) => {
  const { menuId, pageNum, pageSize } = params
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(VIDEO_LIST).filter(item => !menuId || item.menuId.split(',').includes(String(menuId))).splice(pageNum * pageSize, pageSize)
  return Mock.mock(data);
}

const getVideoById = (params) => {
  const id = _get(params, 'id')
  const data = cloneDeep(basicTemplate)
  data.data = VIDEO_LIST.find(item => item.id === String(id)) || null;
  return Mock.mock(data);
}

const getVideoByRandom = (params) => {
  const currentId = _get(params, 'currentId')
  const historyIds = _get(params, 'historyIds') || []
  
  const allIds = VIDEO_LIST.map(e => e.id).filter(id => id !== currentId)
  let unplayedIds = allIds.filter(id => !historyIds.includes(id))
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