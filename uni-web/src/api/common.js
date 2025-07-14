import request from './request.js';

export function getCurrentUse11r(params) {
  return request({
    url: 'api/user/getUser',
    params,
  });
}

