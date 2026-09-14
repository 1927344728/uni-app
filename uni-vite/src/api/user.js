import request from './request.js';

export function getUserInfo(options = {}) {
  return request({
    url: 'api/user/getUserInfo',
    ...options
  });
}