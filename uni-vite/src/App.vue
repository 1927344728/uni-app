<script>
  export default {
    onLaunch: function() {
      console.log('App Launch')
    },
    onShow: function() {
      console.log('App Show')
    },
    onHide: function() {
      console.log('App Hide')
    }
  }
</script>

<style lang="less">
  /* nvue 只支持 class 选择器，全局 reset / 标签选择器不能编进去 */
  /* #ifndef APP-PLUS-NVUE */
  @import '@/common/css/reset.less';
  @import '@/common/css/common.less';
  /* #endif */
</style>
