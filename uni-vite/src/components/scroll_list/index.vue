<template>
  <scroll-view class="common_list_module" scroll-y :lower-threshold="50" @scrolltolower="scrolltolower">
    <view v-if="isLoaded && list.length" class="list_wrap">
      <view
        v-for="item in list"
        :key="item.id"
        class="list_item"
        :class="[item.className]"
        hover-class="list_item--hover"
        @tap="openUrl(item)"
      >
        <image
          class="thumb"
          :src="scaleImageWidthInCOS(item.thumb, 120)"
          mode="aspectFill"
          :style="{ width: '120rpx', height: '120rpx' }"
        />
        <view class="content">
          <view class="title">{{ item.title }}</view>
          <view v-if="item.note" class="note">{{ item.note }}</view>
        </view>
        <view v-if="item.badgeText" class="badge">{{ item.badgeText }}</view>
      </view>
    </view>
    <view v-if="list.length && pagination.isLast" class="nomore_load_tips">
      ~没有更多了哦~
    </view>
    <view v-if="isLoaded && !list.length" class="nothing_tips">
      ~什么都没有哦~
    </view>
  </scroll-view>
</template>

<script>
import { openUrl, scaleImageWidthInCOS, stringifyQuery } from '@/common/js/common.js'

export default {
  props: {
    request: {
      type: Function,
      required: true,
    },
    queryParams: {
      type: Object,
      default: () => ({})
    },
    pageNum: Number,
    pageSize: Number,
  },
	data () {
		return {
      isLoaded: false,
			list: [],
      pagination: this.initPagination(),
      cacheMap: {}
		}
	},
  created () {
		this.getList()
	},
	methods: {
    openUrl,
    scaleImageWidthInCOS,
    initPagination () {
      return {
        pageNum: this.pageNum || 0,
        pageSize: this.pageSize || 15,
        isLast: false
      }
    },
		async getList () {
      const { queryParams, pagination, list, cacheMap } = this
      const params = {
        ...(queryParams || {}),
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      }
      const cacheKey = stringifyQuery(params)
      let data = cacheMap[cacheKey]
      if (!data) {
        data = await this.request(params).catch(() => {})
        if (data && 'content' in data) {
          data = data.content
        }
        cacheMap[cacheKey] = data
      }
      this.list = list.concat(data || [])
      if (!data || data.length < pagination.pageSize) {
        pagination.isLast = true
      }
      this.isLoaded = true
    },
    refreshList () {
			this.isLoaded = false
      this.list = []
      this.pagination = this.initPagination()
      this.getList()
    },
		scrolltolower () {
			if (!this.pagination.isLast)  {
        this.pagination.pageNum ++
        this.getList()
      }
		}
	},
}
</script>
<style lang="less">
@import '@/common/css/common.less';
@import '@/common/css/color.less';
@import '@/common/css/apply.less';
.common_list_module {
  height: 100%;
  box-sizing: border-box;

  & .list_wrap {
    background: #fff;
  }

  & .list_item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1px solid @border-primary-color;
    box-sizing: border-box;

    & .thumb {
      flex-shrink: 0;
      width: 120rpx;
      height: 120rpx;
      margin-right: 24rpx;
      border-radius: 12rpx;
      background: #f5f5f5;
    }

    & .content {
      flex: 1;
      min-width: 0;
      overflow: hidden;

      & .title {
        font-size: 30rpx;
        line-height: 42rpx;
        color: @text-primary-color;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & .note {
        margin-top: 8rpx;
        font-size: 26rpx;
        line-height: 36rpx;
        color: @text-patch1-color;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    & .badge {
      flex-shrink: 0;
      margin-left: 12rpx;
      padding: 2rpx 10rpx;
      font-size: 22rpx;
      line-height: 32rpx;
      color: #fff;
      background: red;
      border-radius: 20rpx;
    }
  }

  & .list_item--hover {
    background: #f8f8f8;
  }

  & .list_item.active {
    & .title,
    & .note {
      color: @primary-color;
      font-weight: bold;
    }
  }
}
</style>
