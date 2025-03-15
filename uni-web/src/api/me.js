import request from './request.js';

export function getSimpleMessage(id) {
  return request({
    url: 'api/simple',
  });
}