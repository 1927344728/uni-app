<template>
  <view class="search_bar_module">
    <uni-data-picker
      v-if="subTypeOptions && subTypeOptions.length > 1"
      class="type_picker"
      v-model="queryParams.subType"
      placeholder="请选择类型"
      popup-title="请选择类型"
      :localdata="subTypeOptions"
    />
    <uni-search-bar
      class="search_input"
      v-model.trim="queryParams.keyword"
      placeholder="请输入搜索词"
      :radius="100"
      cancelButton="none"
      @clear="queryParams.keyword = ''"
    />
  </view>
</template>
<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    subTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:value'],
  computed: {
    queryParams: {
      get () {
        return this.value
      },
      set (v) {
        this.$emit('update:value', v)
      }
    }
  }
}
</script>
<style lang="less">
@import '@/common/css/color.less';
.search_bar_module {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  display: flex;
  align-items: center;
  background: white;
  border-top: 2rpx solid @border-primary-color;
  border-bottom: 2rpx solid @border-primary-color;
  // 小程序里自定义组件会多出一层节点，flex 项是 <uni-data-picker> 本身，
  // 而非组件内部的 .uni-data-tree，尺寸相关的声明必须挂在组件标签的 class 上
  & .type_picker {
    flex: 1 1 0;
    max-width: 42%;
    min-width: 0;
  }
  & .search_input {
    flex: 1 1 0;
    min-width: 0;
  }
  & .uni-data-tree {
    width: 100%;
    padding: 10px 8px 10px 10px;
    box-sizing: border-box;
    & ::v-deep {
      & .uni-data-tree-input {
        width: auto;
      }
      & .input-value,
      & .input-value-border {
        width: auto !important;
        max-width: 100%;
        border: 0;
        background: rgb(248, 248, 248);
        border-radius: 60px;
      }
      & .selected-area {
        display: flex;
        flex: 0 1 auto;
        max-width: 100%;
        overflow: hidden;
      }
      & .selected-list,
      & .selected-item,
      & .text-color {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & .placeholder {
        font-size: 14px;
        color: #B3B3B3;
      }
    }
  }
}
</style>
