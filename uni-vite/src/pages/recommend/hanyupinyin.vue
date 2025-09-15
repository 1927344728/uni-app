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
				<uni-easyinput v-model="searchKey" type="text" class="search_key" placeholder="搜索拼音..." clearable></uni-easyinput>
				<text class="search_button" @click="onClickSearch">
					搜索
				</text>
			</view>
	
	    <view class="pinyin_controls">
				<button class="button control_play" @click="playCurrent">
					播放选中
				</button>
				<button class="button control_stop" @click="stop">
					停止
				</button>
				<button class="button control_all" @click="playAll">
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
	export default {
		data () {
			return {
				pinyinType: 'all',
				pinyinValue: 'b',
				searchKey: '',
				pinyinTypeOptions: PINYIN_TYPE_OPTIONS,
				pinyinCharacters: PINYIN_CHARACTERS,
				audioContext: null,
				isStop: false
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
		methods: {
			onClickPinyinType (o) {
				this.pinyinType = o.value
				this.searchKey = ''
				this.pinyinCharacters = o.value === 'all' ? PINYIN_CHARACTERS : PINYIN_CHARACTERS.filter(c => c.type === this.pinyinType)
			},
			onClickSearch () {
				const { searchKey } = this
				this.pinyinCharacters = searchKey ? PINYIN_CHARACTERS.filter(c => c.value === searchKey) : PINYIN_CHARACTERS
			},
			onClickPinyin (item) {
				this.pinyinValue = item.value
				this.searchKey = ''
				this.play(item)
			},
			play (item) {
				if (this.audioContext) {
					this.audioContext.pause()
					this.audioContext.destroy()
				}
				this.audioContext = uni.createInnerAudioContext();
				this.audioContext.autoplay = true;
				this.audioContext.src = `${COS_ASSET_PATH}/audio/hanyupinyin/${item.audio || item.value}.mp3`;;
				this.audioContext.onPlay(() => {
				  console.log('开始播放');
				});
				this.audioContext.onError((res) => {
				  console.log(res.errMsg);
				  console.log(res.errCode);
				});
			},
			playCurrent () {
				const item = PINYIN_CHARACTERS.find(c => c.value === this.pinyinValue)
				if (item) {
					this.play(item)
				}
			},
			stop () {
				if (this.audioContext) {
					this.audioContext.pause()
					this.audioContext.destroy()
				}
				this.isStop = true
			},
			async playAll () {
				const { pinyinCharacters, isStop } = this
				this.stop()
				this.isStop = false
				for (const pinyin of pinyinCharacters) {
				  if (isStop) {
				    return
				  }
				  this.pinyinValue = pinyin.value
				  this.play(pinyin);
				  await new Promise(resolve => {
				    this.audioContext.onEnded(resolve)
				  })
				  await new Promise(resolve => setTimeout(resolve, 500));
				}
			}
		}
	}
</script>

 <style lang="less">
   @import './hanyupinyin.css';
 </style>