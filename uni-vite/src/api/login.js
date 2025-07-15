import request from './request.js';

export function login(params) {
  return request({
    url: 'api/login',
    params,
  });
}

export function logout() {
  return request({
    url: 'api/logout'
  });
}

