import request from './request.js';

export function getVideoMenuList(params, options = {}) {
  return request({
    url: 'api/video/getVideoMenuList',
    params,
		...options
  });
}


export function getVideoPageList(params, options = {}) {
  return request({
    url: 'api/video/getVideoPageList',
    params,
		...options
  });
}

export function getVideoById(params, options = {}) {
  return request({
    url: 'api/video/getVideoById',
    params,
		...options
  });
}

export function getVideoByRandom(params, options = {}) {
  return request({
    url: 'api/video/getVideoByRandom',
    params,
		...options
  });
}

export function getVideoListByMenuId(params, options = {}) {
  return request({
    url: 'api/video/getVideoListByMenuId',
    params,
		...options
  });
}