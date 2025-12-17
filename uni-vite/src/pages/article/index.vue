<template>
	<view class="article_page">
		<ScrollList :request="getArticlePageList" :pageSize="5" />
	</view>
</template>

<script>
import { getArticlePageList } from '@/api'
import ScrollList from '@/components/scroll_list/index.vue'

export default {
	components: { ScrollList },
	methods: {
    getArticlePageList
	},
}
</script>