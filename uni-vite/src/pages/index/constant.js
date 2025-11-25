import { COS_ASSET_PATH } from "@/utils/variables.js"

export const FEATURE_ICON_ENUM = [
	{
		key: 'task',
		name: '任务中心',
		image: `${COS_ASSET_PATH}images/d502c279bba37f3dfe78158803cfff37.jpg`,
		// url: '/pages/task/index',
		url: '',
		jumpTo: 'navigate'
	},
	{
		key: 'book',
		name: '我的书单',
		image: `${COS_ASSET_PATH}images/d4f59adc3c18b9289aef1f340a93357e.jpg`,
		url: '/pages/study/book/index',
		jumpTo: 'navigate'
	},
	{
		key: 'audio',
		name: '音乐收藏',
		image: `${COS_ASSET_PATH}images/d055efbe683f9117949d5fa4088f0d55.jpg`,
		url: '/pages/music/index',
		jumpTo: 'navigate'
	},
	{
		key: 'video',
		name: '视频订阅',
		image: `${COS_ASSET_PATH}images/147d5438ef903fcbbac27fc51b5627c8.jpg`,
		url: '',
		jumpTo: 'navigate'
	},
]

export const RECOMMEND_ARTICLES = [
	{
		id: 1,
		title: '汉语拼音发音学习',
		desc: '点击任意拼音即可播放发音',
		image: `${COS_ASSET_PATH}images/微信图片_20251117234041_35_2.jpg?imageMogr2/thumbnail/160`,
		// url: 'https://1927344728.github.io/web-page/hanyupinyin.html',
		url: '/static/hanyupinyin.html',
		readCount: 1200,
		collectCount: 200,
		jumpTo: 'webview'
	},
	{
		id: 2,
		title: '摄影笔记深度解析',
		desc: '从原理到实践的摄影入门指南——深入解读宁思潇潇的经典之作',
		image: `${COS_ASSET_PATH}images/tBzDxA-yeF6XfLSfgXrQlQ.jpg`,
		url: '/static/photography.html',
		readCount: 1800,
		collectCount: 142,
		jumpTo: 'webview'
	},
	{
		id: 3,
		title: '中国地方特色水果图鉴',
		desc: '每一方水土，都有其独特的甜蜜献礼。探索中国大地上风味各异的地方名果。',
		image: `${COS_ASSET_PATH}images/9aa1951aeb5a45e186eeef1d6e39296d463b6f2911c6ff-SlTBw5_fw1200webp.webp`,
		url: '/static/fruit.html',
		readCount: 1800,
		collectCount: 142,
		jumpTo: 'webview'
	},
]