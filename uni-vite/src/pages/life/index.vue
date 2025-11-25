<template>
	<view class="life-page">
		<view class="life-nav">
			<view
				v-for="o in items.filter(o => o.component)"
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
		<MusicList v-if="currentId === 'music'" />
		<FooterBar :activeTabKey="activeTabKey" />
	</view>
</template>
<script>
import store from '@/store/index'
import MusicList from '../music/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'

const items = [
	{ id: 'music', name: '音乐', component: 'MusicList' },
	{ id: 'video', name: '视频', component: '' },
	{ id: 'dance', name: '舞蹈', component: '' },
	{ id: 'travel', name: '旅游', component: '' },
]
export default {
	components: {
		MusicList,
		FooterBar
	},
	data () {
		return {
			currentId: 'music',
			items
		}
	},
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		}
	},
	created () {
		store.commit('setActiveTabKey', 'life')
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