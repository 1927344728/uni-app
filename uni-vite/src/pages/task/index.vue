<template>
	<view class="task_page">
		<view class="task_toolbar">
      <view class="task_toolbar_select">
        <uni-data-select
          v-model="queryParam.targeter"
          :localdata="targeterList"
          :clear="!!queryParam.targeter"
          @clear="queryParam.targeter = null"
        />
        <uni-data-select
          v-model="queryParam.status"
          :localdata="statusList"
          :clear="!!queryParam.status"
          @clear="queryParam.status = null"
        />
      </view>
      <uni-search-bar
        v-model.trim="queryParam.keyword"
        placeholder="请输入任务名称"
        :radius="100"
        @clear="queryParam.keyword = ''"
      />
		</view>

		<scroll-view v-if="taskList.length" class="task_list" scroll-y :lower-threshold="50" @scrolltolower="scrolltolower">
			<view v-for="item in taskList" :key="item.id" class="task_item" @click="gotoDetail(item)">
				<view class="task_item_header">
					<view class="title">{{ textEllipsis(item.title, 14) }}</view>
					<view class="status_tag" :class="[`status_${item.status}`]">
            {{ statusMap[item.status] }}
          </view>
				</view>

        <view class="task_item_meta">
          任务人：{{ item.targeter }}
        </view>
				<view class="task_item_meta">
					发布人：{{ item.publisher }}
				</view>
				<view class="content">
          {{ item.content }}
        </view>

				<view class="progress_wrap">
					<view class="progress_bar">
						<view class="progress_inner" :style="{ width: item.progress + '%' }"></view>
					</view>
					<view class="progress_text">
            {{ item.progress }}%
          </view>
				</view>
			</view>
			<view v-if="pagination.isLast" class="nomore_load_tips">~没有更多了~</view>
		</scroll-view>

		<FooterBar :activeTabKey="activeTabKey" />
	</view>
</template>

<script>
import store from '@/store/index'
import { getTaskTargeterList, getTaskPageList } from '@/api'
import { textEllipsis } from '@/utils'
import { TASK_STATUS_ENUM } from './constant.js'
import FooterBar from '@/components/footer_bar/index.vue'

const initQueryParam = () => ({
  keyword: '',
  status: null,
  targeter: null
})
const initPagination = () => ({
  pageNum: 0,
  pageSize: 4,
  isLast: false
})
export default {
	components: { FooterBar },
	data () {
		return {
      isLoad: false,
			taskList: [],
      targeterList: [],
      queryParam: initQueryParam(),
      pagination: initPagination(),
      statusMap: TASK_STATUS_ENUM,
		}
	},
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		},
    statusList () {
      return [{
        value: '',
        text: '所有状态',
      }].concat(Object.keys(TASK_STATUS_ENUM).map(key => ({
        value: Number(key),
        text: TASK_STATUS_ENUM[key],
      })))
    }
	},
  watch: {
    queryParam: {
      handler () {
        this.refreshList()
      },
      deep: true
    }
  },
  created () {
		store.commit('setActiveTabKey', 'task')
    this.getTaskTargeterList()
		this.getTaskPageList()
	},
	methods: {
    textEllipsis,
    getTaskTargeterList () {
      return getTaskTargeterList().then((data) => {
        this.targeterList = [{ value: '', text: '所有任务人' }].concat((data || []).map(name => ({
          value: name,
          text: name,
        })))
      })
    },
		getTaskPageList () {
      const { queryParam, pagination, taskList } = this
			return getTaskPageList({
        title: queryParam.keyword,
        status: queryParam.status,
        targeter: queryParam.targeter,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      }).then((data) => {
        this.taskList = taskList.concat(data || [])
        this.isLoad = true
        if (!data || data.length < pagination.pageSize) {
          pagination.isLast = true
        }
      })
		},
    refreshList () {
			this.taskList = [],
      this.pagination = initPagination()
      this.getTaskPageList()
    },
		scrolltolower () {
      console.log('scrolltolower')
			if (!this.pagination.isLast)  {
        this.pagination.pageNum ++
        this.getTaskPageList()
      }
		},
    gotoDetail (item) {
      uni.navigateTo({
        url: `/pages/task/detail?id=${item.id}`
      })
    }
	},
}
</script>

<style lang="less">
@import './index.less';
</style>