<template>
  <view v-if="articleDetail" class="article_detail_page">
    <view class="article_detail_header">
      <text class="title">{{ articleDetail.title }}</text>
      <text class="author">{{ articleDetail.author }}</text>
    </view>

    <view class="article_detail_content">
      <block v-for="(item, idx) in articleDetail.content" :key="idx">
        <template v-if="item.type === 'text'">
          <view v-for="(tx, i) in [item[item.type]].flat()" :key="tx + i" class="article_detail_item" :class="[item.type]">
            <text>{{ tx }}</text>
          </view>
        </template>

        <template v-if="item.type === 'richText'">
          <view v-for="(rtx, i) in [item[item.type]].flat()" :key="rtx + i" class="article_detail_item" :class="[item.type]">
            <view v-html="rtx"></view>
          </view>
        </template>

        <template v-if="item.type === 'image'">
          <view v-for="(img, i) in [item[item.type]].flat()" :key="img + i" class="article_detail_item" :class="[item.type]">
            <image
              :src="img + ((img || '').includes('?') ? '&' : '?') + 'imageMogr2/thumbnail/750x'"
              mode="widthFix"
              class="image"
              @click="previewImage(img, [item[item.type]].flat())"
            />
            <view v-if="item.description && i + 1 === [item[item.type]].flat().length" class="desc">
              {{ item.description }}
            </view>
          </view>
        </template>

        <template v-if="item.type === 'video'">
          <view v-for="(v, i) in [item[item.type]].flat()" :key="v + i"  class="article_detail_item" :class="[item.type]">
            <video
              :src="v"
              class="video"
              controls
              :object-fit="item.objectFit || 'contain'"
              :poster="item.poster"
            ></video>
            <view v-if="item.description && i + 1 === [item[item.type]].flat().length" class="desc">
              {{ item.description }}
            </view>
          </view>
        </template>
      </block>
    </view>
  </view>
</template>

<script>
import { getArticleById } from '@/api'

export default {
  data() {
    return {
      articleDetail: null
    };
  },
  async onLoad(options = {}) {
    const id = options.id || options.articleId || null;
    if (id) {
      this.getArticleById(id)
    }
  },
  methods: {
    getArticleById (id) {
      return getArticleById({
        id
      }).then((data) => {
        this.articleDetail = data || null
        if (data && data.title) {
          uni.setNavigationBarTitle({ title: data.title });
        }
      })
    },
    normalizeImages(item) {
      if (!item) return [];
      const imgs = item.images || item.img || [];
      if (Array.isArray(imgs)) return imgs;
      if (!imgs) return [];
      return [imgs];
    },
    normalizeVideos(item) {
      if (!item) return [];
      const vids = item.videos || item.video || [];
      if (Array.isArray(vids)) return vids;
      if (!vids) return [];
      return [vids];
    },
    normalizeRichTexts(item) {
      if (!item) return [];
      const r = item.richTexts || item.richText || item.richtext || [];
      if (Array.isArray(r)) return r;
      if (!r) return [];
      return [r];
    },
    previewImage(current, urls) {
      if (typeof uni !== 'undefined' && uni.previewImage) {
        uni.previewImage({ current, urls });
        return;
      }
      // fallback: open in new window (web)
      window.open(current, '_blank');
    },
    playVideo(url) {
      this.currentVideo = url;
      this.showVideo = true;
    },
    closeVideo() {
      this.showVideo = false;
      this.currentVideo = null;
    }
  }
};
</script>

<style lang="less">
@import './detail.less';
</style>

