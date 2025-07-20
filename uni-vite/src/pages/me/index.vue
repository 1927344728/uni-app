<template>
  <view>
    <view class="me_page" v-if="userInfo">
      <view class="user_info_box">
        <image class="avatar" :src="defaultAvatar" mode="aspectFill" />
        <view class="user_detail">
          <view class="user_name">
            {{ userInfo.name }}
            <text class="role_tag">
              {{ getRoleLabel(userInfo.role) }}
            </text>
          </view>
          <view class="user_phone">
            <uni-icons type="phone" size="18" color="#14C8A5" />
            <a :href="'tel:' + userInfo.phone_number">{{ userInfo.phone_number }}</a>
          </view>
        </view>
      </view>
      <view class="logout_button" @click="onLogout">
        退出登录
      </view>
    </view>
    <FooterBar />
  </view>
</template>

<script>
import { getCurrentUser, logout } from '@/api'
import FooterBar from '@/components/footer_bar/index.vue'
import { LOGO_COLOR_IMAGE } from '@/config/index.js'

// #ifdef WEB
console.log('WEB')
// #endif

export default {
  components: {
		FooterBar
  },
  data() {
    return {
			userInfo: null,
      defaultAvatar: LOGO_COLOR_IMAGE
    };
  },
  async created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
			return getCurrentUser().then((data) => {
				this.userInfo = data
			}).catch(error => {
				console.log(error)
			})
    },
    getRoleLabel(role) {
      const map = { 1: '超级管理员', 2: '家长', 3: '学生' };
      return map[role] || '未知角色';
    },
    onLogout() {
      return logout().then(() => {
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }).then(() => {
        uni.redirectTo({
          url: '/pages/index/index'
        });
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