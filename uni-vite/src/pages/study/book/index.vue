<template>
  <scroll-view class="study-book-page" scroll-y="true" @scrolltolower="onScrollToLower" lower-threshold="50">
    <view class="page-header">
      <view>
        <text class="page-title">一兆精选 · 图书馆</text>
        <text class="page-subtitle">沉浸阅读 · 私藏好书随时借阅</text>
      </view>
    </view>

    <view class="book-list">
      <view class="book-card" v-for="book in bookList" :key="book.id" @click="onClickCard(book)">
        <image class="book-cover" mode="aspectFill" :src="book.cover" />
        <view class="book-content">
          <view class="book-title-row">
            <text class="book-title">{{ book.title }}</text>
            <view class="score-wrapper">
              <text class="book-score">{{ book.score }}</text>
              <text class="score-suffix">分</text>
            </view>
          </view>

          <view class="meta-row">
            <text class="meta-item">作者：{{ book.author }}</text>
						<text class="meta-dot">·</text>
					  <text class="meta-item">书主：{{ book.owner }}</text>
          </view>

          <text class="book-desc">
            {{ book.description }}
          </text>

          <view class="tag-row">
            <text class="book-tag" v-for="tag in book.tags" :key="tag">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <FooterBar :activeTabKey="activeTabKey" />
  </scroll-view>
</template>
<script>
import store from '@/store/index'
import FooterBar from '@/components/footer_bar/index.vue'

export default {
  components: {
    FooterBar
  },
  data () {
    return {
      bookList: [
        {
          id: 1,
          title: '红楼梦（全二册）',
          author: '曹雪芹',
          owner: '木心藏书阁',
          score: 9.7,
          cover: 'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg',
          description: '百科全书式的家族兴衰传奇，宝黛爱情与人间真情的终极写照。',
          tags: ['必读', '经典推荐', '一兆珍藏']
        },
        {
          id: 2,
          title: '时间简史（插图本）',
          author: '史蒂芬·霍金',
          owner: '星际读书会',
          score: 9.4,
          cover: 'https://img2.doubanio.com/view/subject/l/public/s1775746.jpg',
          description: '以极简语言讲述宇宙起源与命运，跨越时间的物理学入门。',
          tags: ['科普', '上新', '必读']
        },
        {
          id: 3,
          title: '小王子',
          author: '圣埃克苏佩里',
          owner: '橙子童书屋',
          score: 9.6,
          cover: 'https://img2.doubanio.com/view/subject/l/public/s1103152.jpg',
          description: '献给长大成人的孩子，温柔讲述孤独、爱与责任。',
          tags: ['治愈', '闲置可借', '亲子']
        },
        {
          id: 4,
          title: '自私的基因',
          author: '理查德·道金斯',
          owner: 'Darwin Club',
          score: 9.1,
          cover: 'https://img2.doubanio.com/view/subject/l/public/s1314474.jpg',
          description: '用基因视角重新理解生命与进化，是现代生物学思维的起点。',
          tags: ['思考', '推荐', '进化论']
        },
        {
          id: 5,
          title: '百年孤独',
          author: '加西亚·马尔克斯',
          owner: 'REAL魔幻社',
          score: 9.5,
          cover: 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg',
          description: '布恩迪亚家族七代人的孤独与宿命，魔幻现实主义巅峰。',
          tags: ['诺奖', '故事感', '必读']
        }
      ]
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
		onClickCard (item) {
			if (item) {
				uni.navigateTo({
					url: `/pages/study/book/detail?id=${encodeURIComponent(item.id)}`
				});
			}
		},
    onScrollToLower () {
      console.log('滚动到底部加载更多')
    }
	}
}
</script>
<style lang="less">
@import './index.less';
</style>