import request from './request.js';
import { TOOL_API_HOSTNAME, CLIENT_HOSTNAME, WX_HOSTNAME } from '@/utils/variables.js'

export function getCurrentUser(params) {
  return request({
    url: 'api/user/getUser',
    params,
  });
}
