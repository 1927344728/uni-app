<template>
  <view>
    <view class="me_page">
      <view v-if="userInfo" class="user_info">
        <image class="avatar" :src="defaultAvatar" mode="aspectFill" />
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
        <view class="mock" :class="[isUseMock ? 'network' : 'local']" @click="onClickMock">
          {{ isUseMock ? '连接数据库' : '使用本地数据' }}
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
import { openUrl } from '@/utils'
import store from '@/store/index'
import { getUserInfo, logout } from '@/api'
import FooterBar from '@/components/footer_bar/index.vue'
import { DEFAULT_AVATAR_IMAGE } from '@/config/index.js'

const FEATURE_OPTIONS = [
  {
    name: '我的音乐',
    url: '/pages/music/index',
    jumpTo: 'navigate'
  },
  {
    name: '我的视频',
    url: '/pages/video/index?menuId=1',
    jumpTo: 'navigate'
  },
  {
    name: '我的文章',
    url: '/pages/article/index',
    jumpTo: 'navigate'
  },
  {
    name: '我的书单',
    url: '/pages/study/book/index',
    jumpTo: 'navigate'
  },
  {
    name: '我的成绩',
    url: '/pages/article/index',
    jumpTo: 'navigate'
  }
]

export default {
  components: {
    FooterBar
  },
  data() {
    return {
      defaultAvatar: DEFAULT_AVATAR_IMAGE,
      featureOptions: FEATURE_OPTIONS
    };
  },
  computed: {
    isUseMock () {
      return store.state.isUseMock
    },
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
    onClickMock () {
      const bool =  !this.isUseMock
      store.commit('setIsUseMock', bool)
      uni.showModal({
        title: bool ? '仅有部分数据' : '全部数据',
        content: bool ? '当前使用本地数据' : '已使用正常网络请求',
        showCancel: false,
        confirmText: '知道了'
      })
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
        uni.navigateTo({
          url: '/pages/index/index'
        })
      })
      .catch(error => {
        uni.showToast({
          title: '登出失败',
          icon: 'none'
        })
        console.log(error)
      })
    }
  }
};
</script>

<style lang="less">
@import './index.less';
</style>