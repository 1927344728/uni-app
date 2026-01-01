<template>
  <view v-if="task" class="task_detail">
    <view class="task_detail_title">
      {{ task.title }}
    </view>
    <view v-if="task.publisher" class="task_detail_author">
      {{ task.publisher }}
    </view>

    <view class="task_detail_item">
      <view class="item_label">发布人</view>
      <view class="item_value">{{ task.publisher || '' }}</view>
    </view>

    <view v-if="task.publishTime || task.publishTime === 0" class="task_detail_item">
      <view class="item_label">发布时间</view>
      <view class="item_value">{{ parseTime(task.publishTime, '{y}-{m}-{d}') }}</view>
    </view>

    <view v-if="task.startTime || task.startTime === 0" class="task_detail_item">
      <view class="item_label">开始时间</view>
      <view class="item_value">{{ parseTime(task.startTime, '{y}-{m}-{d}') }}</view>
    </view>

    <view v-if="task.endTime || task.endTime === 0" class="task_detail_item">
      <view class="item_label">结束时间</view>
      <view class="item_value">{{ parseTime(task.endTime, '{y}-{m}-{d}') }}</view>
    </view>

    <view class="task_detail_item">
      <view class="item_label">任务内容</view>
      <view class="item_value">{{ task.content || '' }}</view>
    </view>

    <view class="task_detail_item">
      <view class="item_label">验收标准</view>
      <view class="item_value">{{ task.finished || '' }}</view>
    </view>

    <view class="task_detail_item">
      <view class="item_label">状态</view>
      <view class="item_value">
        <view class="item_value_status" :class="`status_${task.status}`">
          {{ statusMap[task.status] }}
        </view>
      </view>
    </view>

    <view class="task_detail_item">
      <view class="item_label">进度</view>
      <view class="item_value">
        <view class="progress_wrap">
          <view class="progress_bar">
            <view class="progress_inner" :style="{ width: task.progress + '%' }"></view>
          </view>
          <view class="progress_text">{{ task.progress }}%</view>
        </view>
      </view>
    </view>

    <view v-if="task.awards && task.awards.length" class="task_detail_item block">
      <view class="item_label">奖励</view>
      <view class="item_value">
        <ArticleDetail :articleData="task.awards" />
      </view>
    </view>

    <view v-if="task.attachments && task.attachments.length" class="task_detail_item block">
      <view class="item_label">附件</view>
      <view class="item_value">
        <ArticleDetail :articleData="task.attachments" />
      </view>
    </view>

    <view v-if="task.works && task.works.length" class="task_detail_item block">
      <view class="item_label">作品</view>
      <view class="item_value">
        <ArticleDetail :articleData="task.works" />
      </view>
    </view>
  </view>
</template>

<script>
import { getTaskById } from '@/api/index.js'
import { parseTime } from '@/utils/index.js'
import { TASK_STATUS_ENUM } from './constant.js'
import ArticleDetail from '@/components/article_detail/index.vue'

export default {
  components: {
    ArticleDetail
  },
  data () {
    return {
      task: null,
      statusMap: TASK_STATUS_ENUM,
    }
  },
  onLoad (options) {
    const id = options && options.id
    if (id) {
      return getTaskById({id}).then((data) => {
        this.task = data || {}
      })
    }
  },
  methods: {
    parseTime
  }
}
</script>

<style lang="less">
@import './detail.less';
</style>
