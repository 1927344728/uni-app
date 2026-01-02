import request from './request.js';

export function helloWord() {
  return request({
    url: 'api/hello/helloWord',
  });
}

export function getBannerList() {
  return request({
    url: 'api/common/getBannerList',
  });
}

export function getRecommendList() {
  return request({
    url: 'api/common/getRecommendList',
  });
}