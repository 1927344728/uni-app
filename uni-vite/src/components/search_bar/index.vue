<template>
  <view class="search_bar_module">
    <view v-if="subTypeOptions && subTypeOptions.length > 1" class="type_picker">
      <uni-data-picker
        class="type_picker_input"
        v-model="queryParams.subType"
        placeholder="请选择类型"
        popup-title="请选择类型"
        :border="false"
        :localdata="subTypeOptions"
      />
    </view>
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
  // 小程序里父级样式穿不进 uni-data-picker 内部，胶囊背景、圆角和四周间距一律做在外层容器上，
  // 组件内部那圈默认的方角边框改用 :border="false" 关掉。
  // 尺寸与 uni-search-bar 对齐：36px 高、10px 外边距、rgb(248,248,248) 底色
  & .type_picker {
    flex: 1 1 0;
    max-width: 42%;
    min-width: 0;
    display: flex;
    align-items: center;
    height: 36px;
    margin: 10px 0 10px 10px;
    background: rgb(248, 248, 248);
    border-radius: 100px;
  }
  // 小程序里自定义组件会多出一层节点，撑满宽度的声明要挂在组件标签的 class 上，
  // 否则内部的 .uni-data-tree 拿不到宽度
  & .type_picker_input {
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  & .search_input {
    flex: 1 1 0;
    min-width: 0;
  }
  // 下面几条只是字号和省略号，H5 / App 靠 ::v-deep 穿进组件（uni-app 会给组件样式自动加 scoped），
  // 小程序有样式隔离穿不进去，不影响可用性
  & ::v-deep {
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
</style>
