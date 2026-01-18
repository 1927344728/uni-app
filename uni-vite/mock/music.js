import { get as _get, cloneDeep } from "lodash"
import { MUSIC_MENU_LIST } from "/database/type_enum.js"
import { MUSIC_LIST } from "/database/music.js"
import { basicTemplate } from './common'

const musicList = cloneDeep(MUSIC_LIST).map(e => {
  e.id = String(e.id)
  e.type = String(e.type) ? String(e.type).split(',') : []
  return e
})

const getMusicMenuList = () => {
  const data = cloneDeep(basicTemplate)
  data.data = cloneDeep(MUSIC_MENU_LIST)
  return data
}

const getMusicPageList = (params) => {
  const { type, keyword, pageNum = 0, pageSize = 10 } = params

  let list = musicList
  if (type) {
    list = list.filter(item => item.type.includes(String(type)))
  } else {
    list = list.filter(item => !item.type.includes('4'))
  }
  if (keyword) {
    list = list.filter(item => item.title.includes(keyword))
  }
  list = list.splice(pageNum * pageSize, pageSize)

  const data = cloneDeep(basicTemplate)
  data.data = list
  return data
}

const getMusicById = (params = {}) => {
  const { id } = params
  const data = cloneDeep(basicTemplate)
  data.data = musicList.find(item => String(item.id) === String(id)) || null;
  return data
}

const getMusicByIds = (params = {}) => {
  const ids = (params.ids || []).map(id => String(id))
  const list = musicList
    .filter(item => ids.includes(String(item.id)))
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) || null;

  const data = cloneDeep(basicTemplate)
  data.data = list
  return data
}

const getMusicByRandom = (params) => {
  let { type, playingIds, playedIds } = params || {}
  type = type ? String(type) : ''
  playingIds = (playingIds || []).map(id => String(id))
  playedIds = (playedIds || []).map(id => String(id))

  let list = musicList
  if (type) {
    list = list.filter(item => item.type.includes(String(type)))
  } else {
    list = list.filter(item => !item.type.includes('4'))
  }
  const allIds = list.map(e => e.id).filter(id => !playingIds.includes(id))
  let unplayedIds = allIds.filter(id => !playedIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];

  const data = cloneDeep(basicTemplate)
  data.data = list.find(e => String(e.id) === String(songId)) || null;

  return data
}

export default {
  'api/music/getMusicMenuList': getMusicMenuList,
  'api/music/getMusicPageList': getMusicPageList,
  'api/music/getMusicById': getMusicById,
  'api/music/getMusicByIds': getMusicByIds,
  'api/music/getMusicByRandom': getMusicByRandom
}