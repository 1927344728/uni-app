import request from './request.js';

export function getBookPageList(params) {
  return request({
    url: 'api/book/getBookPageList',
    params
  });
}

export function getBookById(params) {
  return request({
    url: 'api/book/getBookById',
    params
  });
}