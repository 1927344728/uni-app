<template>
  <scroll-view class="common_list_module" scroll-y :lower-threshold="50" @scrolltolower="scrolltolower">
    <uni-list v-if="isLoaded && list.length">
      <uni-list-item
        v-for="item in list"
        :key="item.id"
        :class="[item.className]"
        :title="item.title"
        :note="item.note"
        :thumb="scaleImageWidthInCOS(item.thumb, 120)"
        :showBadge="!!item.badgeText"
        :badgeText="item.badgeText"
        :badgeStyle="{
          background: 'red',
          fontSize: '14px'
        }"
        thumbSize="lg"
        link
        @click="openUrl(item)"
      >
        <template v-slot:header>
          <image class="slot-image" :src="scaleImageWidthInCOS(item.thumb, 120)" mode="aspectFill" />
        </template>
      </uni-list-item>
    </uni-list>
    <view v-if="list.length && pagination.isLast" class="nomore_load_tips">
      ~没有更多了哦~
    </view>
    <view v-if="isLoaded && !list.length" class="nothing_tips">
      ~什么都没有哦~
    </view>
  </scroll-view>
</template>

<script>
import qs from 'qs'
import { openUrl, scaleImageWidthInCOS } from '@/utils'

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
      const cacheKey = qs.stringify(params)
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
      console.log('scrollList: scrolltolower')
			if (!this.pagination.isLast)  {
        this.pagination.pageNum ++
        this.getList()
      }
		}
	},
}
</script>
<style lang="less">
@import '@/common/css/reset.less';
@import '@/common/css/common.less';
@import '@/common/css/color.less';
@import '@/common/css/apply.less';
.common_list_module {
  height: calc(100vh - constant(safe-area-inset-bottom));
  height: calc(100vh - env(safe-area-inset-bottom));
  & .uni-list {
    & ::v-deep .uni-list--border-top {
      display: none;
    }
    & .uni-list-item {
      & .slot-image {
        width: 60px;
        height: 60px;
        margin-right: 24rpx;
        border-radius: 12rpx;
      }
    }
    & .uni-list-item.active {
      & ::v-deep .uni-list-item__content-title {
        font-weight: bold;
        color: #59c2ad;
      }
      & ::v-deep .uni-list-item__content-note {
        color: #59c2ad;
      }
    }
  }
}
</style>