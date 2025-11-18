<template>
  <view class="study-book-detail-page">
    <scroll-view class="detail-scroll" scroll-y>
      <view class="book-hero">
        <image class="book-cover" :src="book.cover" mode="aspectFill" />
        <view class="hero-info">
          <text class="book-title">{{ book.title }}</text>
          <view class="hero-meta">
            <text class="meta-label">作者：</text>
            <text class="meta-value">{{ book.author }}</text>
          </view>
          <view class="hero-meta">
            <text class="meta-label">书主：</text>
            <text class="meta-value">{{ book.owner }}</text>
          </view>
          <view class="rating-row">
            <text class="rating-label">评分：</text>
            <text class="rating-value">{{ book.score }}</text>
            <view class="rating-stars">
              <text
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ active: n <= Math.round(book.score / 2) }"
              >
                ★
              </text>
            </view>
          </view>
          <view class="tag-row">
            <text class="book-tag" v-for="tag in book.tags" :key="tag">{{ tag }}</text>
          </view>
        </view>
      </view>

			<view class="book-content">
				<view class="book-content-wrapper">
					<view class="section-card">
						<view class="section-title">书籍简介</view>
						<text class="section-body">{{ book.summary }}</text>
					</view>
								
					<view class="section-card">
						<view class="section-title">精彩内容</view>
						<view class="highlight-list">
							<view class="highlight-item" v-for="(highlight, index) in book.highlights" :key="index">
								<text class="highlight-text">{{ highlight }}</text>
							</view>
						</view>
					</view>
								
					<view class="section-card">
						<view class="section-title">读者留言</view>
						<view class="comment-list">
							<view class="comment-item" v-for="comment in book.comments" :key="comment.id">
								<view class="comment-header">
									<view class="avatar">{{ comment.nickname.slice(0, 1) }}</view>
									<view class="comment-info">
										<text class="nickname">{{ comment.nickname }}</text>
										<text class="meta-dot"> · </text>
										<text class="comment-time">{{ comment.time }}</text>
									</view>
								</view>
								<text class="comment-content">{{ comment.content }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      book: {
        cover: 'https://img9.doubanio.com/view/subject/l/public/s1142384.jpg',
        title: '苏东坡传',
        author: '林语堂',
        owner: '晚风书房',
        score: 9.5,
        tags: ['传记', '历史人物', '人文经典', '读书会热荐'],
        summary:
          '这是林语堂写给苏轼的一封长信。作者以风趣笔触串起苏轼的一生——从意气风发到屡遭贬谪，再到晚年豁达，展现一个自在、鲜活的苏东坡。',
        highlights: [
          '“人有悲欢离合，月有阴晴圆缺，此事古难全。”',
          '“竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。”',
          '“我本无家更安往，故乡无此好湖山。”'
        ],
        comments: [
          {
            id: 1,
            nickname: '时光客',
            time: '2小时前',
            content: '林语堂写得很妙，读苏轼的遭遇竟然会笑出来，真是稀奇。'
          },
          {
            id: 2,
            nickname: '海盐柠檬',
            time: '昨天',
            content: '苏东坡的豁达治好了我的焦虑，强烈安利给工作繁忙的人。'
          },
          {
            id: 3,
            nickname: '松间明月',
            time: '2天前',
            content: '读完更想去一趟黄州，走一走东坡小道。'
          },
          {
            id: 4,
            nickname: '星河入梦',
            time: '3天前',
            content: '作者把史料写成了故事，读起来像在和苏轼聊天。'
          },
          {
            id: 5,
            nickname: '不眠旅人',
            time: '上周',
            content: '放在床头的治愈系读物，每次翻开都有新感受。'
          }
        ]
      }
    }
  }
}
</script>

<style lang="less">
@import './detail.less';
</style>