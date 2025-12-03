<template>
  <view class="life-page" :class="classObject">
    <view v-if="filteredItems.length > 1" class="life-nav">
      <view
        v-for="o in filteredItems"
        :key="o.id"
        class="item"
        :class="{
          active: currentId === o.id
        }"
        @click="currentId = o.id"
      >
        {{ o.name }}
      </view>
    </view>
    <MusicList v-if="currentId === 'music'" :class="classObject" />
    <VideoList v-if="currentId === 'video'" :class="classObject" />
    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>
<script>
import store from '@/store/index'
import MusicList from '../music/index.vue'
import VideoList from '../video/index.vue'
import FooterBar from '@/components/footer_bar/index.vue'

const items = [
  { id: 'music', name: '音乐', component: 'MusicList' },
  { id: 'video', name: '视频', component: 'VideoList' },
  { id: 'dance', name: '舞蹈', component: '' },
  { id: 'travel', name: '旅游', component: '' },
]
export default {
  components: {
    MusicList,
    VideoList,
    FooterBar
  },
  data () {
    return {
      currentId: 'music'
    }
  },
  onLoad (options = {}) {
    if (options.tab) {
      const tabItem = items.find(o => o.id === options.tab)
      if (tabItem) {
        this.currentId = tabItem.id
      }
    }
  },
  computed: {
    activeTabKey () {
      return store.state.activeTabKey
    },
    filteredItems () {
      return items.filter(e => e.component)
    },
    classObject () {
      return {
        'with_padding_top': this.filteredItems.length > 1
      }
    }
  },
  created () {
    store.commit('setActiveTabKey', 'life')
  },
  methods: {
    onClickItem (item) {
      
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>