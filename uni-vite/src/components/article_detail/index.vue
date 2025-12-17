<template>
  <view class="article_detail_module">
    <block v-for="(item, idx) in articleData" :key="idx">
      <template v-if="item.type === 'text'">
        <view v-for="(tx, i) in [item.content].flat()" :key="tx + i" class="article_detail_item" :class="[item.type]">
          <text>{{ tx }}</text>
        </view>
      </template>

      <template v-if="item.type === 'richText'">
        <view v-for="(rtx, i) in [item.content].flat()" :key="rtx + i" class="article_detail_item" :class="[item.type]">
          <view v-html="rtx"></view>
        </view>
      </template>

      <template v-if="item.type === 'image'">
        <view v-for="(img, i) in [item.content].flat()" :key="img + i" class="article_detail_item" :class="[item.type]">
          <image
            :src="img + ((img || '').includes('?') ? '&' : '?') + 'imageMogr2/thumbnail/750x'"
            mode="widthFix"
            class="image"
            @click="previewImage(i, [item.content].flat())"
          />
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </template>

      <template v-if="item.type === 'video'">
        <view v-for="(v, i) in [item.content].flat()" :key="v + i"  class="article_detail_item" :class="[item.type]">
          <video
            :src="v"
            class="video"
            controls
            :object-fit="item.objectFit || 'contain'"
            :poster="item.poster"
          ></video>
          <view v-if="item.description && i + 1 === [item.content].flat().length" class="desc">
            {{ item.description }}
          </view>
        </view>
      </template>
    </block>
  </view>
</template>

<script>
export default {
  props: {
    articleData: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    previewImage(current, urls) {
      if (typeof uni !== 'undefined' && uni.previewImage) {
        uni.previewImage({ current, urls });
        return;
      }
      window.open(current, '_blank');
    },
  }
};
</script>

<style lang="less">
@import './index.less';
</style>

