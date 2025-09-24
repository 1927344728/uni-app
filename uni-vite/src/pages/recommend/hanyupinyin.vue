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
	import { COS_ASSET_PATH } from '@/utils/variables'
	import { PINYIN_TYPE_OPTIONS, PINYIN_CHARACTERS } from './hanyupinyin.js'
	import { cloneDeep } from 'lodash'
	
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

 <style lang="less">
   @import './hanyupinyin.css';
 </style>