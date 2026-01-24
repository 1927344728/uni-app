<template>
	<view class="task_page">
		<view class="task_toolbar">
      <view class="task_toolbar_select">
        <uni-data-picker
          v-model="queryParam.targeter"
          :localdata="targeterList"
          :clear="true"
          placeholder="请选择任务人"
          popup-title="请选择任务人"
          @clear="queryParam.targeter = null"
        />
        <uni-data-picker
          v-model="queryParam.status"
          :localdata="statusList"
          :clear="true"
          placeholder="请选择状态"
          popup-title="请选择状态"
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

		<view v-if="taskList.length" class="task_list">
			<view v-for="item in taskList" :key="item.id" class="task_item" @click="gotoDetail(item)">
				<view class="task_item_header">
					<view class="title">{{ item.title }}</view>
					<view class="status_tag">
            <view class="tag" :class="[`status_${item.status}`]">
              {{ statusMap[item.status] }}
            </view>
          </view>
				</view>

        <view class="task_item_meta">
          任务人：{{ item.targeter }}
        </view>
				<view class="task_item_meta">
					发布者：{{ item.publisher }}
				</view>
				<view class="content">
          {{ item.content }}
        </view>

				<view v-if="item.status === 2" class="progress_wrap">
					<view class="progress_bar">
						<view class="progress_inner" :style="{ width: item.progress + '%' }"></view>
					</view>
					<view class="progress_text">
            {{ item.progress }}%
          </view>
				</view>
			</view>
			<view v-if="pagination.isLast" class="nomore_load_tips">~没有更多了~</view>
		</view>

		<FooterBar activeTabKey="task" />
	</view>
</template>

<script>
import { get as _get } from 'lodash'
import { getTaskTargeterList, getTaskPageList } from '@/api'
import { TASK_STATUS_ENUM } from './constant.js'
import FooterBar from '@/components/footer_bar/index.vue'

const initQueryParam = () => ({
  keyword: '',
  status: null,
  targeter: null
})
const initPagination = () => ({
  pageNum: 0,
  pageSize: 10,
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
    statusList () {
      return Object.keys(TASK_STATUS_ENUM).map(key => ({
        value: Number(key),
        text: TASK_STATUS_ENUM[key],
      }))
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
    this.getTaskTargeterList()
		this.getTaskPageList()
	},
  onReachBottom () {
    if (!this.pagination.isLast)  {
      console.log('onReachBottom')
      this.pagination.pageNum ++
      this.getTaskPageList()
    }
  },
	methods: {
    getTaskTargeterList () {
      return getTaskTargeterList().then((data) => {
        this.targeterList = (data || []).map(name => ({
          value: name,
          text: name,
        }))
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
				const list = _get(data, 'content') || []
        this.taskList = taskList.concat(list)
        if (list.length < pagination.pageSize) {
          pagination.isLast = true
        }
      }).finally(() => {
        this.isLoad = true
      })
		},
    refreshList () {
			this.taskList = [],
      this.pagination = initPagination()
      this.getTaskPageList()
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