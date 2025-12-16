import request from './request.js';

export function getArticlePageList(params, options = {}) {
  return request({
    url: 'api/article/getArticlePageList',
    params,
    ...options
  });
}

export function getArticleById(params, options = {}) {
  return request({
    url: 'api/article/getArticleById',
    params,
    ...options
  });
}