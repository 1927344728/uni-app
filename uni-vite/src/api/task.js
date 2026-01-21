import request from './request.js';

export function getTaskPageList(params) {
  return request({
    url: 'api/task/getTaskPageList',
    params
  });
}

export function getTaskById(params) {
  return request({
    url: 'api/task/getTaskById',
    params
  });
}

export function getTaskTargeterList(params) {
  return request({
    url: 'api/task/getTaskTargeterList',
    params
  });
}