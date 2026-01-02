import { get as _get, cloneDeep } from "lodash"
import { MUSIC_MENU_LIST, MUSIC_LIST } from "/database/music.js"
import { basicTemplate } from './common'

const getMusicMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(MUSIC_MENU_LIST)
  return data
}

const getMusicPageList = (params) => {
  const { keyword, pageNum, pageSize } = params
  let list = cloneDeep(MUSIC_LIST)
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword))
  }
  list = list.splice(pageNum * pageSize, pageSize)
  const data = cloneDeep(basicTemplate)
  data.data = list
  return data
}

const getMusicById = (params) => {
  const id = _get(params, 'id')
  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.find(item => item.id === String(id)) || null;
  return data
}

const getMusicByRandom = (params) => {
  const playingMusicIds = _get(params, 'playingMusicIds') || []
  const playedMusicIds = _get(params, 'playedMusicIds') || []
  
  const allIds = MUSIC_LIST.map(e => e.id).filter(id => !playingMusicIds.includes(id))
  let unplayedIds = allIds.filter(id => !playedMusicIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];

  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.find(e => e.id === songId) || null;

  return data
}

const getMusicListByMenuId = (params) => {
  const data = cloneDeep(basicTemplate)
  data.data = MUSIC_LIST.filter(item => String(item.menuId) === String(_get(params, 'menuId'))) || null;
  return data
}

export default {
  'api/music/getMusicMenuList': getMusicMenuList,
  'api/music/getMusicPageList': getMusicPageList,
  'api/music/getMusicById': getMusicById,
  'api/music/getMusicByRandom': getMusicByRandom,
  'api/music/getMusicListByMenuId': getMusicListByMenuId,
}