import { get as _get, cloneDeep } from "lodash"
import Mock from "mockjs"
import { MUSIC_MENU_LIST, MUSIC_LIST } from "/database/music.js"
import { basicTemplate } from './common'

const getMusicMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(MUSIC_MENU_LIST)
  return Mock.mock(data);
}

const getMusicPageList = (params) => {
  const { pageNum, pageSize } = params
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(MUSIC_LIST).splice(pageNum * pageSize, pageSize)
  return Mock.mock(data);
}

const getMusicById = (params) => {
  const id = _get(params, 'id')
  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.find(item => item.id === String(id)) || null;
  return Mock.mock(data);
}

const getMusicByRandom = (params) => {
  const currentId = _get(params, 'currentId')
  const historyIds = _get(params, 'historyIds') || []
  
  const allIds = MUSIC_LIST.map(e => e.id).filter(id => id !== currentId)
  let unplayedIds = allIds.filter(id => !historyIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];

  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.find(e => e.id === songId) || null;

  return Mock.mock(data);
}

const getMusicListByMenuId = (params) => {
  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.filter(item => String(item.menuId) === String(_get(params, 'menuId'))) || null;
  return Mock.mock(data);
}

export default {
  'api/music/getMusicMenuList': getMusicMenuList,
  'api/music/getMusicPageList': getMusicPageList,
  'api/music/getMusicById': getMusicById,
  'api/music/getMusicByRandom': getMusicByRandom,
  'api/music/getMusicListByMenuId': getMusicListByMenuId,
}