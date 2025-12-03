import { VIDEO_LIST } from '../constant.js';

export function getVideoListByMenuId(menuId) {
  return VIDEO_LIST.filter(item => item.menuId === menuId);
}

export function pickRandomVideo(currentId, historyIds = []) {
  const allIds = VIDEO_LIST.map(e => e.id).filter(id => id !== currentId)
  let unplayedIds = allIds.filter(id => !historyIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const videoId = unplayedIds[randIdx];
  return VIDEO_LIST.find(e => e.id === videoId) || null;
}