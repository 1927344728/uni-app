import request from './request.js';

export function getCurrentUser(params, options = {}) {
  return request({
    url: 'api/user/getUser',
    params,
		...options
  });
}
