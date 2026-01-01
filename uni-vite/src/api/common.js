import request from './request.js';

export function helloWord() {
  return request({
    url: 'api/hello/helloWord',
  });
}


export function getUserInfo() {
  return request({
    url: 'api/user/getUserInfo',
  });
}

