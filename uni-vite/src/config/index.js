import { COS_ASSET_PATH } from '@/utils/variables'
// export const HOME_BANNER_IMAGE = `${COS_ASSET_PATH}images/uni_20250313204613.jpg`
// export const HOME_BANNER_IMAGE = `${COS_ASSET_PATH}images/微信图片_20251117231226_33_2.jpg`
export const HOME_BANNER_IMAGE = `${COS_ASSET_PATH}images/微信图片_20251117231227_34_2.jpg`
// export const HOME_BANNER_IMAGE = `${COS_ASSET_PATH}images/微信图片_20251117231226_32_2.jpg`
export const LOGO_WHITE_IMAGE = `${COS_ASSET_PATH}images/hanchuang-log.png`
export const LOGO_COLOR_IMAGE = `${COS_ASSET_PATH}images/hanchuang-log.png`

export const BANNER_LIST = [
	{
		id: 2,
		title: '天空青草',
		type: 'image',
		image: `${COS_ASSET_PATH}images/微信图片_20251117231227_34_2.jpg`,
		url: '',
		jumpTo: 'webview'
	},
	{
		id: 3,
		title: '阅读时刻',
		type: 'image',
		image: `${COS_ASSET_PATH}images/微信图片_20251117231226_32_2.jpg`,
		url: '',
		jumpTo: 'webview'
	},
	{
		id: 1,
		title: '优雅聆听',
		type: 'image',
		image: `${COS_ASSET_PATH}images/微信图片_20251117231226_33_2.jpg`,
		url: '/static/hanyupinyin.html',
		jumpTo: 'webview'
	},
]