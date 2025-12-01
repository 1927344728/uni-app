import { decodeLyricBuffer } from '@/utils/common';
import { MUSIC_LIST } from '../constant.js';

export function getMusicListByMenuId(menuId) {
  return MUSIC_LIST.filter(item => item.menuId === menuId);
}

export function pickRandomMusic(currentId, historyIds = []) {
  const allIds = MUSIC_LIST.map(e => e.id).filter(id => id !== currentId)
  let unplayedIds = allIds.filter(id => !historyIds.includes(id))
  if (!unplayedIds.length) {
    unplayedIds = allIds
  }
  const randIdx = Math.floor(Math.random() * unplayedIds.length);
  const songId = unplayedIds[randIdx];
  return MUSIC_LIST.find(e => e.id === songId) || null;
}

export function fetchFileTextByUrl (url = '') {
  if (!url) return '';
  return new Promise(resolve => {
    uni.request({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'text/plain;charset=utf-8',
        Accept: 'text/plain'
      },
      success: res => {
        if (typeof res?.data === 'string') {
          resolve(res.data);
          return;
        }
        if (res?.data instanceof ArrayBuffer) {
          resolve(decodeLyricBuffer(res.data));
          return;
        }
        resolve('');
      },
      fail: () => {
        resolve('');
      }
    });
  });
}

export async function parseLyric (lyricSource = '') {
  let lyricLines = [];
  if (lyricSource) {
    try {
      const lyricText = lyricSource.startsWith('http') ? await fetchFileTextByUrl(lyricSource) : lyricSource;
      if (lyricText) {
        lyricLines = lyricText
          .split(/\n+/)
          .map(line => {
            const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?](.*)/);
            if (!match) return null;
            const minute = Number(match[1]);
            const second = Number(match[2]);
            const millisecond = Number(match[3] || 0);
            return {
              time: minute * 60 + second + millisecond / 1000,
              text: match[4].trim()
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.time - b.time);
      }
    } catch (error) {}
  }
  return lyricLines;
}

export function getMusicLyricByUrl(url) {
  if (!url) return '';
  return new Promise(resolve => {
    uni.request({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'text/plain;charset=utf-8',
        Accept: 'text/plain'
      },
      success: res => {
        if (typeof res?.data === 'string') {
          resolve(res.data);
          return;
        }
        if (res?.data instanceof ArrayBuffer) {
          resolve(decodeLyricBuffer(res.data));
          return;
        }
        resolve('');
      },
      fail: () => {
        resolve('');
      }
    });
  });
}

export function formatTime (value) {
  const seconds = Math.floor(value || 0);
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  const m = minute < 10 ? `0${minute}` : `${minute}`;
  const s = second < 10 ? `0${second}` : `${second}`;
  return `${m}:${s}`;
}