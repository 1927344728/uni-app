<template>
  <scroll-view class="common_list_module" scroll-y :lower-threshold="50" @scrolltolower="scrolltolower">
    <uni-list v-if="isLoad && list.length">
      <uni-list-item
        v-for="item in list"
        :key="item.id"
        :title="item.title"
        :note="item.note"
        :thumb="item.image"
        thumbSize="lg"
        link
        @click="openUrl(item)"
      />
    </uni-list>
    <view v-if="list.length && pagination.isLast" class="nomore_load_tips">
      ~没有更多了~
    </view>
    <view v-if="isLoad && !list.length" class="nothing_tips">
      ~什么都没有哦~
    </view>
  </scroll-view>
</template>

<script>
import { openUrl } from '@/utils'

export default {
  props: {
    request: {
      type: Function,
      required: true,
    },
    pageNum: Number,
    pageSize: Number,
  },
	data () {
		return {
      isLoad: false,
			list: [],
      pagination: this.initPagination(),
		}
	},
  created () {
		this.getList()
	},
	methods: {
    openUrl,
    initPagination () {
      return {
        pageNum: this.pageNum || 0,
        pageSize: this.pageSize || 15,
        isLast: false
      }
    },
		getList () {
      const { pagination, list } = this
      this.isLoad = false
			return this.request({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      })
        .then((data) => {
          this.list = list.concat(data || [])
          if (!data || data.length < pagination.pageSize) {
            pagination.isLast = true
          }
        })
        .finally(() => {
          this.isLoad = true
        })
		},
    refreshList () {
      this.list = []
      this.pagination = this.initPagination()
      this.getList()
    },
		scrolltolower () {
      console.log('scrolltolower')
			if (!this.pagination.isLast)  {
        this.pagination.pageNum ++
        this.getList()
      }
		}
	},
}
</script>
<style lang="less">
@import '@/common/css/reset.css';
@import '@/common/css/common.css';
@import '@/common/css/color.less';
@import '@/common/css/apply.css';
.common_list_module {
  height: calc(100vh - constant(safe-area-inset-bottom));
  height: calc(100vh - env(safe-area-inset-bottom));
  & ::v-deep .uni-icons {
    display: none;
  }
}
</style>