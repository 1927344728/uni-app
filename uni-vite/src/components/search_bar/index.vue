<template>
  <view class="search_bar_module">
    <uni-data-picker
      v-if="subTypeOptions && subTypeOptions.length > 1"
      v-model="queryParams.subType"
      placeholder="请选择类型"
      popup-title="请选择类型"
      :localdata="subTypeOptions"
    />
    <uni-search-bar
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
  background: white;
  border-top: 2rpx solid @border-primary-color;
  border-bottom: 2rpx solid @border-primary-color;
  & .uni-data-tree {
    flex: 1;
    padding: 10px;
    & ::v-deep {
      & .input-value-border {
        border: 0;
        background: rgb(248, 248, 248);
        border-radius: 60px;
      }
      & .placeholder {
        font-size: 14px;
        color: #B3B3B3;
      }
    }
  }
  & .uni-searchbar {
    flex: 2;
  }
}
</style>