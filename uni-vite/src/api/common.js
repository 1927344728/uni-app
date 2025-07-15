import request from './request.js';

export function helloWord() {
  return request({
    url: 'api/hello/helloWord',
  });
}

