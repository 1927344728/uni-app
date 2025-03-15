<template>
	<view class="home_page">
		<view class="home_banner">
			<image class="home_banner_image" mode="aspectFill" :src="bannerImage"></image>
		</view>
		<view class="home_nav">
			<view class="home_nav_main">
				<navigator class="nav"  url="/pages/culture/index" open-type="navigate">
					中国文化
				</navigator>
				<navigator class="nav"  url="" open-type="navigate">
					书籍
				</navigator>
				<navigator class="nav"  url="" open-type="navigate">
					家
				</navigator>
				<navigator class="nav" url="/pages/me/index" open-type="navigate">
					我
				</navigator>
			</view>
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
		this.bannerImage = 'https://app-1259410276.cos.ap-shanghai.myqcloud.com/uni/images/uni_20250313204613.jpg'
	},
	methods: {

	}
}
</script>

<style>\
	* {
		padding: 0;
		box-sizing: border-box;
	}
	.home_page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.home_banner {
		width: 100%;
	}
	.home_banner .home_banner_image {
		display: block;
		width: 100%;
		height: 200px;
	}
	.home_nav {
		width: 100%;
		padding: 9px;
		box-sizing: border-box;
	}
	.home_nav .home_nav_main {
		width: 100%;
		display: flex;
	}
	.home_nav .home_nav_main .nav {
		flex: 25%;
		padding: 4px 8px;
		color: white;
		text-align: center;
		border: 1px solid #0dd;
		border-radius: 12px;
		background: #0dd;
	}
	.home_nav .home_nav_main .nav:not(:last-child) {
		margin-right: 9px;
	}
</style>
