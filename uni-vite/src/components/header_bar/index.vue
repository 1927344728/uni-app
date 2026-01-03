<template>
	<view v-if="list && list.length > 1" class="common_header_nav">
		<view
			v-for="o in list"
			:key="o.key"
			class="item"
			:class="{
				active: currentTab === o.key
			}"
			@click="currentTab = o.key"
		>
			{{ o.name }}
		</view>
	</view>
</template>
<script>
export default {
  props: {
		value: {
			type: String,
			requried: true
		},
		list: {
			type: Array,
			default: () => []
		}
	},
  emits: ['update:value'],
	computed: {
		currentTab: {
			get () {
				return this.value
			},
			set (tab) {
				this.$emit('update:value', tab)
        this.$emit('change', tab)
			}
		}
	}
}
</script>
<style lang="less">
@import '@/common/css/color.less';
.common_header_nav {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
  line-height: 88rpx;
  background: white;
  border-bottom: 2rpx solid @border-primary-color;
  overflow-x: auto;
  z-index: 10;
  &::-webkit-scrollbar {
    display: none;
  }
  & .item {
    position: relative;
    flex: 1;
    display: inline-block;
    min-width: 160rpx;
    padding: 0 16rpx;
    text-align: center;
    vertical-align: middle;
  }
  & .item.active {
    font-weight: bold;
    font-size: 36rpx;
    color: @primary-color;
  }
  & .item.active::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    width: 1em;
    height: 6rpx;
    content: '';
    border-radius: 6rpx;
    background: @primary-color;
  }
}
</style>