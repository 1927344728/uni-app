import request from './request.js';

export function synthesizeTts(data, options = {}) {
  return request({
    url: 'api/tts/synthesize',
    method: 'POST',
    timeout: 60000,
    data,
    ...options
  });
}
