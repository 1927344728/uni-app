<template>
	<view class="study-page">
		<view class="study-nav">
			<view
				v-for="o in items"
				:key="o.id"
				class="item"
				:class="{
					active: currentId === o.id
				}"
				@click="currentId = o.id"
			>
				{{ o.name }}
			</view>
		</view>
		<FooterBar :activeTabKey="activeTabKey" />
	</view>
</template>
<script>
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'

const items = [
	{ id: 1, name: '课程' },
	{ id: 2, name: '图书馆' },
	{ id: 3, name: '成绩' },
	{ id: 4, name: '阅读' },
	
]
export default {
	components: {
		FooterBar
	},
	data () {
		return {
			currentId: 2,
			items
		}
	},
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		}
	},
	created () {
		store.commit('setActiveTabKey', 'study')
	},
	methods: {
		onClickItem (item) {
			
		}
	}
}
</script>
<style lang="less">
@import './index.less';
</style>