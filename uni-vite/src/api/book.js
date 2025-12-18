import request from './request.js';

export function getBookPageList(params, options = {}) {
  return request({
    url: 'api/book/getBookPageList',
    params,
    ...options
  });
}

export function getBookById(params, options = {}) {
  return request({
    url: 'api/book/getBookById',
    params,
    ...options
  });
}