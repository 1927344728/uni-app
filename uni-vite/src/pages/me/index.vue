<template>
  <view>
    <view class="me_page">
      <view v-if="userInfo" class="user_info">
        <view class="avatar">
          <image class="image" :src="defaultAvatar" mode="aspectFill" />
        </view>
        <view class="user_detail">
          <view class="user_name">
            <text class="name">
              {{ userInfo.nickname || userInfo.name }}
            </text>
            <text class="role">
              {{ getRoleLabel(userInfo.role)}}
            </text>
          </view>
          <view class="user_phone">
            <a class="phone" :href="`tel:${userInfo.phone_number}`">
              {{ userInfo.phone_number }}
            </a>
          </view>
        </view>
      </view>
      <view v-else class="login">
        <view class="button" @click="gotoLogin">
          登录
        </view>
      </view>
      <view class="main">
        <view class="features">					
          <view
            v-for="item in featureOptions"
            :key="item.name"
            class="item"
            @click="openUrl(item)"
          >
            <view>{{ item.name }}</view>
            <uni-icons type="right" size="18" color="#ccc"></uni-icons>
          </view>
        </view>

        <view class="features">					
          <view
            v-for="item in baseOptions"
            :key="item.key"
            class="item"
            @click="onClickOther(item)"
          >
            <view>{{ item.name }}</view>
            <uni-icons type="right" size="18" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
      <view v-if="userInfo" class="logout">
        <text class="text" @click="onChangePassword">修改密码</text>
        |
        <text class="text" @click="onLogout">退出登录</text>
      </view>
    </view>
    <FooterBar activeTabKey="me" />
  </view>
</template>

<script>
import { get as _get } from 'lodash'
import store from '@/store/index'
import { openUrl, scaleImageWidthInCOS } from '@/utils'
import { welcome, getUserInfo, logout } from '@/api'
import FooterBar from '@/components/footer_bar/index.vue'

const FEATURE_OPTIONS = [
  {
    name: '我的音乐',
    url: '/pages/music/index?type=3',
    jumpTo: 'navigate'
  },
  {
    name: '我的视频',
    url: '/pages/video/index?type=3',
    jumpTo: 'navigate'
  },
  {
    name: '我的文章',
    url: '/pages/article/index?type=6',
    jumpTo: 'navigate'
  },
  {
    name: '我的书单',
    url: '/pages/book/index',
    jumpTo: 'navigate'
  },
  {
    name: '我的成绩',
    url: '/pages/article/index?type=1',
    jumpTo: 'navigate'
  }
]

const BASE_OPTIONS = [
  {
    key: 'cache',
    name: '清除缓存',
  },
  {
    key: 'about',
    name: '关于',
  },
]

export default {
  components: {
    FooterBar
  },
  data() {
    return {
      defaultAvatar: scaleImageWidthInCOS('https://yizhao-1259410276.cos.ap-shanghai.myqcloud.com/images/snowman-8755896_1280.png', 160),
      featureOptions: FEATURE_OPTIONS,
      baseOptions: BASE_OPTIONS
    };
  },
  computed: {
    userInfo () {
      return _get(store, 'state.userInfo')
    },
    activeTabKey () {
      return store.state.activeTabKey
    }
  },
  created() {
    store.commit('setActiveTabKey', 'me')
    this.fetchData();
  },
  methods: {
    openUrl,
    fetchData() {
      return getUserInfo().then((data) => {
        store.commit('setUserInfo', data)
      })
    },
    getRoleLabel(role) {
      const map = {
        1: '超级管理员',
        2: '家长',
        3: '学生'
      };
      return map[role] || '未知角色';
    },
    onClickOther (item) {
      if (item.key === 'cache') {
        uni.clearStorageSync();
        uni.showToast({
          title: '缓存已清除！',
          duration: 3000,
          icon: 'success'
        });
        return
      }
      if (item.key === 'about') {
        uni.navigateTo({
          url: '/pages/me/about'
        })
      }
    },
    gotoLogin () {
      uni.navigateTo({
        url: '/pages/login/index',
        fail (error) {
          uni.showModal({
            title: '请求异常',
            content: error.errMsg,
            showCancel: false
          });
        }
      });
    },
    onChangePassword () {
      uni.navigateTo({
        url: '/pages/login/password'
      })
    },
    onLogout() {
      return logout().then(() => {
        store.commit('setIsUseMock', true)
        uni.navigateTo({
          url: '/pages/index/index'
        })
      })
      .catch(error => {
        uni.showToast({
          title: '登出失败',
          icon: 'none'
        })
      })
    }
  }
};
</script>

<style lang="less">
@import './index.less';
</style>