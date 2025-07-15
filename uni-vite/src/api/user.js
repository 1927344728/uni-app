import request from './request.js';

export function getCurrentUser(params) {
  return request({
    url: 'api/user/getUser',
    params,
  });
}
