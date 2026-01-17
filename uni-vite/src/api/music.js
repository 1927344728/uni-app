import request from './request.js';

export function getMusicMenuList(params, options = {}) {
  return request({
    url: 'api/music/getMusicMenuList',
    params,
		...options
  });
}


export function getMusicPageList(params, options = {}) {
  return request({
    url: 'api/music/getMusicPageList',
    params,
		...options
  });
}

export function getMusicById(params, options = {}) {
  return request({
    url: 'api/music/getMusicById',
    params,
		...options
  });
}

export function getMusicByIds(params, options = {}) {
  return request({
    url: 'api/music/getMusicByIds',
    params,
		...options
  });
}

export function getMusicByRandom(params, options = {}) {
  return request({
    url: 'api/music/getMusicByRandom',
    params,
		...options
  });
}

export function getMusicListByType(params, options = {}) {
  return request({
    url: 'api/music/getMusicListByType',
    params,
		...options
  });
}