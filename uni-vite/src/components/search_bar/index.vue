<template>
  <view class="search_bar_module">
    <uni-data-select
      v-if="subTypeOptions && subTypeOptions.length"
      v-model="queryParams.subType"
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
  & .uni-stat__select {
    flex: 1;
    margin-left: 10px;
    & ::v-deep .uni-stat-box {
      & .uni-select {
        padding-left: 24rpx;
        padding-right: 24rpx;
        background: rgb(248, 248, 248);
        border: 0;
        border-radius: 100rpx;
        & .uni-select__input-placeholder {
          font-size: 28rpx;
          color: #999;
        }
        & .uni-icons {
          color: rgb(192, 196, 204);
          font-size: 40rpx!important;
        }
      }
    }
  }
  & .uni-searchbar {
    flex: 2;
  }
}
</style>