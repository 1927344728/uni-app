import request from './request.js';

export function getUserInfo() {
  return request({
    url: 'api/user/getUserInfo',
  });
}