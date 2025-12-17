import request from './request.js';

export function getTaskPageList(params, options = {}) {
  return request({
    url: 'api/task/getTaskPageList',
    params,
    ...options
  });
}

export function getTaskById(params, options = {}) {
  return request({
    url: 'api/task/getTaskById',
    params,
    ...options
  });
}

export function getTaskTargeterList(params, options = {}) {
  return request({
    url: 'api/task/getTaskTargeterList',
    params,
    ...options
  });
}