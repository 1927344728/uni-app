import request from './request.js';

export function getChineseWordList(params, options = {}) {
  return request({
    url: 'api/study/getChineseWordList',
    params,
    ...options
  });
}

export function saveArithmeticScore(data, options = {}) {
  return request({
    url: 'api/study/saveArithmeticScore',
    method: 'POST',
    data,
    ...options
  });
}

export function getArithmeticStats(options = {}) {
  return request({
    url: 'api/study/getArithmeticStats',
    ...options
  });
}

export function getArithmeticScorePageList(params, options = {}) {
  return request({
    url: 'api/study/getArithmeticScorePageList',
    params,
    ...options
  });
}