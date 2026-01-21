import request from './request.js';

export function helloWord() {
  return request({
    url: 'api/hello/helloWord',
  });
}

export function getCategoryEnum() {
  return request({
    url: 'api/common/getCategoryEnum',
  });
}

export function getBannerList() {
  return request({
    url: 'api/common/getBannerList',
  });
}