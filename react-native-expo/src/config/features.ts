import { COS_DOMAIN_NAME } from './constants';

export const HOME_FEATURES = [
  { key: 'task', name: '任务中心', image: `${COS_DOMAIN_NAME}/images/d502c279bba37f3dfe78158803cfff37.jpg`, href: '/task' },
  { key: 'book', name: '我的书单', image: `${COS_DOMAIN_NAME}/images/d4f59adc3c18b9289aef1f340a93357e.jpg`, href: '/book' },
  { key: 'audio', name: '音乐收藏', image: `${COS_DOMAIN_NAME}/images/d055efbe683f9117949d5fa4088f0d55.jpg`, href: '/music' },
  { key: 'video', name: '视频订阅', image: `${COS_DOMAIN_NAME}/images/147d5438ef903fcbbac27fc51b5627c8.jpg`, href: '/video?type=1' },
] as const;
