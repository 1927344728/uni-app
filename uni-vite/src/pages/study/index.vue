<template>
	<view class="study-page">
		<view class="study-nav">
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
		<BookList v-if="currentId === 'bookList'" />
		<FooterBar :activeTabKey="activeTabKey" />
	</view>
</template>
<script>
import store from '@/store/index'
import BookList from './book/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'

const items = [
	{ id: 1, name: '课程', component: '' },
	{ id: 'bookList', name: '图书馆', component: 'BookList' },
	{ id: 3, name: '成绩', component: '' },
	{ id: 4, name: '阅读', component: '' },
]
export default {
	components: {
		BookList,
		FooterBar
	},
	data () {
		return {
			currentId: 'bookList',
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