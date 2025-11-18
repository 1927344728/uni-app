<template>
	<view class="pingyin_page">
		<header>
			<h1>汉语拼音发音学习</h1>
			<view class="description">点击任意拼音即可播放发音</view>
		</header>
		
		<view class="pingyin_card">
			<view class="pingyin_category">
				<view
					v-for="o in pinyinTypeOptions"
					:key="o.value"
					class="button"
					:class="{
						active: o.value === pinyinType
					}"
					@click="onClickPinyinType(o)"
				>
					{{ o.name }}
				</view>
			</view>
			
			<view class="pingyin_search">
				<uni-easyinput
					v-model="searchKey"
					type="text"
					class="search_key"
					placeholder="搜索拼音..."
					clearable
					@clear="clearSearchKey"
				></uni-easyinput>
				<text class="search_button" @click="onClickSearch">
					搜索
				</text>
			</view>
	
	    <view class="pinyin_controls">
				<button class="button control_play" :class="[pinyinValue ? '' : 'disabled']" @click="currentPlay()">
					播放选中
				</button>
				<button class="button control_stop" :class="[pinyinValue ? '' : 'disabled']" @click="stop">
					停止
				</button>
				<button class="button control_all" :class="[pinyinCharacters && pinyinCharacters.length ? '' : 'disabled']"  @click="recursionPlay(pinyinValue)">
					播放全部
				</button>
			</view>
			
			<view class="pinyin_container">
				<view
					v-for="item in pinyinCharacters"
					:key="item.key"
					class="item"
					:class="{
						active: item.value === pinyinValue
					}"
					@click="onClickPinyin(item)"
				>
					<view class="pinyin">{{item.value}}</view>
					<view class="character">{{item.name}}</view>
				</view>
			</view>
			
	    <view class="pinyin_tips">
				共 {{allPinyinCount}} 个拼音，当前显示 {{pinyinCount}} 个
			</view>
		</view>
	</view>
</template>

<script>
	const COS_ASSET_PATH = 'https://app-1259410276.cos.ap-shanghai.myqcloud.com/uni/'
	const PINYIN_TYPE_OPTIONS = [
		{ value: 'all', name: '全部（63）' },
		{ value: 'shengmu', name: '声母（23）' },
		{ value: 'yunmu', name: '韵母（24）' },
		{ value: 'whole', name: '整体认读（16）' },
	]
	
	const PINYIN_CHARACTERS = [
		{ value: 'b', name: '播', type: 'shengmu' },
		{ value: 'p', name: '坡', type: 'shengmu' },
		{ value: 'm', name: '摸', type: 'shengmu' },
		{ value: 'f', name: '佛', type: 'shengmu' },
		{ value: 'd', name: '得', type: 'shengmu' },
		{ value: 't', name: '特', type: 'shengmu' },
		{ value: 'n', name: '讷', type: 'shengmu' },
		{ value: 'l', name: '勒', type: 'shengmu' },
		{ value: 'g', name: '哥', type: 'shengmu' },
		{ value: 'k', name: '科', type: 'shengmu' },
		{ value: 'h', name: '喝', type: 'shengmu' },
		{ value: 'j', name: '鸡', type: 'shengmu' },
		{ value: 'q', name: '旗', type: 'shengmu' },
		{ value: 'x', name: '兮', type: 'shengmu' },
		{ value: 'zh', name: '知', type: 'shengmu' },
		{ value: 'ch', name: '吃', type: 'shengmu' },
		{ value: 'sh', name: '狮', type: 'shengmu' },
		{ value: 'r', name: '日', type: 'shengmu' },
		{ value: 'z', name: '字', type: 'shengmu' },
		{ value: 'c', name: '此', type: 'shengmu' },
		{ value: 's', name: '思', type: 'shengmu' },
		{ value: 'y', name: '衣', type: 'shengmu' },
		{ value: 'w', name: '乌', type: 'shengmu' },
		
		{ value: 'a', name: '啊', type: 'yunmu' },
		{ value: 'o', name: '哦', type: 'yunmu' },
		{ value: 'e', name: '额', type: 'yunmu' },
		{ value: 'i', name: '医', type: 'yunmu' },
		{ value: 'u', name: '乌', type: 'yunmu' },
		{ value: 'ü', name: '鱼', type: 'yunmu', audio: 'v' },
		{ value: 'ai', name: '唉', type: 'yunmu' },
		{ value: 'ei', name: '诶', type: 'yunmu' },
		{ value: 'ui', name: '危', type: 'yunmu' },
		{ value: 'ao', name: '嗷', type: 'yunmu' },
		{ value: 'ou', name: '鸥', type: 'yunmu' },
		{ value: 'iu', name: '于', type: 'yunmu' },
		{ value: 'ie', name: '耶', type: 'yunmu' },
		{ value: 'üe', name: '曰', type: 'yunmu', audio: 've' },
		{ value: 'er', name: '耳', type: 'yunmu' },
		{ value: 'an', name: '安', type: 'yunmu' },
		{ value: 'en', name: '摁', type: 'yunmu' },
		{ value: 'in', name: '音', type: 'yunmu' },
		{ value: 'un', name: '温', type: 'yunmu' },
		{ value: 'ün', name: '云', type: 'yunmu', audio: 'vn' },
		{ value: 'ang', name: '昂', type: 'yunmu' },
		{ value: 'eng', name: '嗯', type: 'yunmu' },
		{ value: 'ing', name: '英', type: 'yunmu' },
		{ value: 'ong', name: '钟', type: 'yunmu' },
		
		{ value: 'zhi', name: '蜘', type: 'whole' },
		{ value: 'chi', name: '吃', type: 'whole' },
		{ value: 'shi', name: '狮', type: 'whole' },
		{ value: 'ri', name: '日', type: 'whole' },
		{ value: 'zi', name: '字', type: 'whole' },
		{ value: 'ci', name: '此', type: 'whole' },
		{ value: 'si', name: '思', type: 'whole' },
		{ value: 'yi', name: '衣', type: 'whole' },
		{ value: 'wu', name: '乌', type: 'whole' },
		{ value: 'yu', name: '鱼', type: 'whole' },
		{ value: 'ye', name: '椰', type: 'whole' },
		{ value: 'yue', name: '约', type: 'whole' },
		{ value: 'yuan', name: '渊', type: 'whole' },
		{ value: 'yin', name: '印', type: 'whole' },
		{ value: 'yun', name: '云', type: 'whole' },
		{ value: 'ying', name: '鹰', type: 'whole' },
	]
	
	let playTimer = null
	export default {
		data () {
			return {
				pinyinType: 'all',
				pinyinValue: 'b',
				searchKey: '',
				pinyinTypeOptions: PINYIN_TYPE_OPTIONS,
				pinyinCharacters: PINYIN_CHARACTERS,
				audioContext: null
			}
		},
		computed: {
			allPinyinCount () {
				return PINYIN_CHARACTERS.length
			},
			pinyinCount () {
				return this.pinyinCharacters.length
			}
		},
		onUnload () {
			this.stop()
		},
		methods: {
			onClickPinyinType (o) {
				this.stop()
				this.pinyinType = o.value
				this.searchKey = ''
				this.pinyinCharacters = o.value === 'all' ? PINYIN_CHARACTERS : PINYIN_CHARACTERS.filter(c => c.type === this.pinyinType)
				this.pinyinValue = this.pinyinCharacters[0].value
			},
			onClickSearch () {
				const { searchKey } = this
				this.pinyinCharacters = searchKey ? PINYIN_CHARACTERS.filter(c => c.value === searchKey) : PINYIN_CHARACTERS
				this.stop()
				if (this.pinyinCharacters[0]) {
					this.pinyinValue = this.pinyinCharacters[0].value
				}
			},
			clearSearchKey () {
				this.pinyinCharacters = PINYIN_CHARACTERS
				this.pinyinValue = PINYIN_CHARACTERS[0].value
			},
			onClickPinyin (item) {
				this.pinyinValue = item.value
				this.searchKey = ''
				this.play(item.value)
			},
			play (value) {
				const self = this
				const item = PINYIN_CHARACTERS.find(c => c.value === value)
				if (item) {
					return new Promise((resolve, reject) => {
						self.clear()
						self.audioContext = uni.createInnerAudioContext();
						self.audioContext.autoplay = true;
						self.audioContext.src = `${COS_ASSET_PATH}/audio/hanyupinyin/${item.audio || item.value}.mp3`;;
						self.audioContext.onEnded(() => {
							resolve()
						})
						self.audioContext.onError((res) => {
							reject(res)
						});
					})
				}
				return Promise.reject()
			},
			clear () {
				if (this.audioContext) {
					this.audioContext.pause()
					this.audioContext.destroy()
					this.audioContext = null
				}
			},
			stop () {
				this.clear()
				this.pinyinValue = null
				clearTimeout(playTimer)
			},
			currentPlay () {
				if (!this.pinyinValue) {
					uni.showToast({
						title: '请选择拼音',
						icon: 'none',
						duration: 2000
					});
					return
				}
				this.play(this.pinyinValue)
			},
			async recursionPlay (value) {
				const self = this
				const { pinyinCharacters } = self
				const currentPinyin = pinyinCharacters.find(c => c.value === value) || pinyinCharacters[0]
				if (currentPinyin) {
					const currentIndex = pinyinCharacters.findIndex(c => c.value === currentPinyin.value)
					self.pinyinValue = currentPinyin.value
					await self.play(currentPinyin.value).catch(() => {})
					const nextPinyin = currentIndex + 1 >= 0 && pinyinCharacters[currentIndex + 1]
					if (nextPinyin) {
						self.pinyinValue = nextPinyin.value
						playTimer = setTimeout(() => {
							self.recursionPlay(self.pinyinValue)
						}, 500)
					}
				}
			}
		}
	}
</script>

<style>
	html,
	body,
	div,
	span,
	applet,
	object,
	iframe,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	p,
	blockquote,
	pre,
	a,
	abbr,
	acronym,
	address,
	big,
	cite,
	code,
	del,
	dfn,
	em,
	img,
	ins,
	kbd,
	q,
	s,
	samp,
	small,
	strike,
	strong,
	sub,
	sup,
	tt,
	var,
	b,
	u,
	i,
	center,
	dl,
	dt,
	dd,
	ol,
	ul,
	li,
	fieldset,
	form,
	label,
	legend,
	table,
	caption,
	tbody,
	tfoot,
	thead,
	tr,
	th,
	td,
	article,
	aside,
	canvas,
	details,
	embed,
	figure,
	figcaption,
	footer,
	header,
	hgroup,
	menu,
	nav,
	output,
	ruby,
	section,
	summary,
	time,
	mark,
	audio,
	video {
	  margin: 0;
	  padding: 0;
	  border: 0;
	  font: inherit;
	  font-size: 100%;
	  vertical-align: baseline;
	}
	
	/* HTML5 display-role reset for older browsers */
	article,
	aside,
	details,
	figcaption,
	figure,
	footer,
	header,
	hgroup,
	menu,
	nav,
	section {
	  display: block;
	}
	
	ol,
	ul {
	  list-style: none;
	}
	
	blockquote,
	q {
	  quotes: none;
	}
	
	blockquote::before,
	blockquote::after,
	q::before,
	q::after {
	  content: '';
	  content: none;
	}
	
	table {
	  border-collapse: collapse;
	  border-spacing: 0;
	}
	
	html {
	  font-family: sans-serif;
	  -webkit-text-size-adjust: 100%;
	  -ms-text-size-adjust: 100%;
	  box-sizing: border-box;
	}
	
	*,
	*::before,
	*::after {
	  box-sizing: inherit;
	}
	
	body {
	  font-family: 'Helvetica Neue', Helvetica, 'microsoft yahei', STHeiTi, sans-serif;
	}
	
	textarea {
	  overflow: auto;
	  vertical-align: top;
	  resize: none;
	}
	
	:focus {
	  outline: none;
	}
	
	:link,
	:visited {
	  text-decoration: none;
	}
	
	a {
	  -webkit-tap-highlight-color: transparent;
	}
	
	a:focus {
	  outline: thin dotted;
	}
	
	a:active,
	a:hover {
	  outline: 0;
	}
</style>

<style lang="less">

.pingyin_page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 9px;
	color: #605b52;
	background: linear-gradient(135deg, #3494e6, #ec6ead);
}

.pingyin_page header {
	text-align: center;
	margin-bottom: 24px;
	color: white;
}

.pingyin_page header h1 {
	margin-bottom: 12px;
	font-size: 40px;
	font-weight: bold;
	text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.pingyin_page header .description {
	font-size: 1.2rem;
	max-width: 800px;
	margin: 0 auto;
	opacity: 0.9;
}

.pingyin_page .pingyin_card {
	background: white;
	border-radius: 16px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	padding: 16px;
}

.pingyin_page .pingyin_card .pingyin_category {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	font-size: 18px;
	color: #605b52;
	text-align: center;
	font-weight: bold;
}

.pingyin_page .pingyin_card .pingyin_category .button {
	flex: 1;
	padding: 12px 6px;
	line-height: 16px;
	background: #f0f0f0;
	border: none;
	border-radius: 24px;
	cursor: pointer;
	transition: all 0.3s;
	white-space: nowrap;
}

.pingyin_page .pingyin_card .pingyin_category .button.active {
	background: #3494e6;
	color: white;
}

.pingyin_page .pingyin_card .pingyin_category .button:hover {
	background: #ddd;
}

.pingyin_page .pingyin_card .pingyin_category .button.active:hover {
	background: #2980b9;
}

.pingyin_page .pingyin_card .pingyin_search {
	display: flex;
	align-items: center;
	margin-top: 16px;
	height: 36px;
}

.pingyin_page .pingyin_card .pingyin_search input {
	flex: 1;
	height: 34px;
	padding: 0 12px;
	line-height: 34px;
	border: 0;
	border-radius: 8px 0 0 8px;
	font-size: 16px;
	transition: border-color 0.3s;
}

.pingyin_page .pingyin_card .pingyin_search input:focus {
	outline: none;
	border-color: #3494e6;
}

.pingyin_page .pingyin_card .pingyin_search .search_button {
	width: 60px;
	height: 36px;
	font-size: 16px;
	line-height: 36px;
	color: white;
	border-radius: 0 8px 8px 0;
	background:  #3494e6;
	text-align: center;
}

.pingyin_page .pinyin_container {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
	gap: 15px;
	margin-top: 16px;
}

.pingyin_page .pinyin_container .item {
	background: #f8f9ff;
	padding: 30px 15px;
	border-radius: 12px;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	position: relative;
	overflow: hidden;
}

.pingyin_page .pinyin_container .item .pinyin {
	font-size: 28px;
	font-weight: bold;
	color: #3494e6;
	margin-bottom: 8px;
}

.pingyin_page .pinyin_container .item .pronunciation {
	font-size: 14px;
	color: #666;
	margin-bottom: 5px;
}

.pingyin_page .pinyin_container .item .character {
	font-size: 22px;
	font-weight: 500;
}

.pingyin_page .pinyin_container .item:hover {
	background: #e0e7ff;
	transform: translateY(-5px);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.pingyin_page .pinyin_container .item.active {
	background: linear-gradient(135deg, #3494e6, #ec6ead);
}

.pingyin_page .pinyin_container .item.active .pinyin {
	color: white;
}

.pingyin_page .pinyin_container .item.active .pronunciation {
	color: rgba(255, 255, 255, 0.9);
}

.pingyin_page .pinyin_container .item.active .character {
	color: white;
}

.pingyin_page .pinyin_controls {
	display: flex;
	justify-content: center;
	margin-top: 16px;
}

.pingyin_page .pinyin_controls .button {
	flex: 2;
	background: #3494e6;
	border: none;
	margin-right: 15px;
	padding: 15px 20px;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 500;
	color: white;
	cursor: pointer;
	transition: background 0.3s;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.pingyin_page .pinyin_controls .button:last-child {
	margin-right: 0;
}

.pingyin_page .pinyin_controls .button:hover {
	background: #2980b9;
}

.pingyin_page .pinyin_controls .button i {
	margin-right: 8px;
}

.pingyin_page .pinyin_controls .button.control_stop {
	flex: 1;
	background: #e74c3c;
}

.pingyin_page .pinyin_controls .button.control_stop:hover {
	background: #c0392b;
}

.pingyin_page .pinyin_controls .button.control_all {
	background: #9b59b6;
}

.pingyin_page .pinyin_controls .button.control_all:hover {
	background: #8e44ad;
}

.pingyin_page .pinyin_controls .button.disabled,
.pingyin_page .pinyin_controls .button.disabled:hover {
	color: white;
	background: #ccc;
}


.pingyin_page .pinyin_tips {
	padding: 4px 16px;
	margin-top: 48px;
	color: #999;
	text-align: center;
}

.pingyin_page .audio_player {
	display: none;
}
 </style>