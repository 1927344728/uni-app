<template>
	<view class="content">
		<view>
			<text class="title">{{title}}</text>
			<navigator url="/pages/company/index?companyId=1" open-type="navigate">
				<button type="default">公司介绍</button>
			</navigator>
			<navigator url="/pages/culture/index" open-type="navigate">
				<button type="default">中国文化</button>
			</navigator>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		console.log('aa')
		return {
			title: 'Hello, Lizhao!'
		}
	},
	onLoad() {

	},
	methods: {

	}
}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
