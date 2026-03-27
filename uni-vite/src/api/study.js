import request from './request.js';

export function getChineseWordList(params, options = {}) {
  return request({
    url: 'api/study/getChineseWordList',
    params,
    ...options
  });
}