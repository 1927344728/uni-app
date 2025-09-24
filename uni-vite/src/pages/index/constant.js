import { COS_ASSET_PATH } from "@/utils/variables.js"

export const FEATURE_ICON_ENUM = [
	{
		key: 'task',
		name: '任务中心',
		image: `${COS_ASSET_PATH}images/d502c279bba37f3dfe78158803cfff37.jpg`,
		url: '/pages/task/index',
	},
	{
		key: 'book',
		name: '我的书单',
		image: `${COS_ASSET_PATH}images/d4f59adc3c18b9289aef1f340a93357e.jpg`,
		url: '',
	},
	{
		key: 'audio',
		name: '音乐收藏',
		image: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
		url: '',
	},
	{
		key: 'video',
		name: '视频订阅',
		image: `${COS_ASSET_PATH}images/147d5438ef903fcbbac27fc51b5627c8.jpg`,
		url: '',
	},
]

export const RECOMMEND_ARTICLES = [
	{
		id: 1,
		title: '汉语拼音发音学习',
		desc: '点击任意拼音即可播放发音',
		image: `${COS_ASSET_PATH}images/20250909222712_5_2.jpg?imageMogr2/thumbnail/160`,
		url: '/pages/recommend/hanyupinyin',
		readCount: 1200,
		collectCount: 200,
		urlOrigin: 'local'
	},
	{
		id: 2,
		title: '周末户外摄影指南',
		desc: '专业摄影师教你拍出完美自然风光',
		image: `${COS_ASSET_PATH}images/tBzDxA-yeF6XfLSfgXrQlQ.jpg`,
		url: 'https://www.baidu.com',
		readCount: 1800,
		collectCount: 142,
		urlOrigin: 'web'
	},
	{
		id: 3,
		title: '周末户外摄影指南',
		desc: '专业摄影师教你拍出完美自然风光',
		image: `${COS_ASSET_PATH}images/tBzDxA-yeF6XfLSfgXrQlQ.jpg`,
		url: 'https://www.baidu.com',
		readCount: 1800,
		collectCount: 142,
		urlOrigin: 'web'
	},
]