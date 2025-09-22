<template>
  <view>
    <view class="me_page">
      <view class="user_info_box">
        <image class="avatar" :src="defaultAvatar" mode="aspectFill" />
        <view class="user_detail">
          <view class="user_name">
						<text class="name">
							{{ userInfo ? userInfo.name : '未知用户' }}
						</text>
            <text v-if="userInfo" class="role">
              {{ userInfo ? getRoleLabel(userInfo.role) : '' }}
            </text>
						<a v-if="userInfo" class="phone" :href="'tel:' + userInfo.phone_number">
							<uni-icons type="phone" size="18" />
						</a>
          </view>
        </view>
      </view>
			<view class="me_main">
				<view class="me_main_content">					
					<view class="me_main_item">我的书单</view>
					<view class="me_main_item">我的成绩</view>
				</view>
			</view>
			<view v-if="!userInfo" class="login_button">
			  <button type="primary" @click="gotoLogin()">
					登录
				</button>
			</view>
      <view v-if="userInfo" class="logout_button">
				<Text class="text" @click="onChangePassword">修改密码</Text>
				|
        <Text class="text" @click="onLogout">退出登录</Text>
      </view>
    </view>
    <FooterBar :activeTabKey="activeTabKey" />
  </view>
</template>

<script>
import { getCurrentUser, logout } from '@/api'
import store from '@/store/index'
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
	computed: {
		activeTabKey () {
			return store.state.activeTabKey
		}
	},
  async created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
			return getCurrentUser(null, {
				login: 0,
				showLoading: 1
			}).then((data) => {
				this.userInfo = data
			}).catch(error => {
				console.log(error)
			})
    },
    getRoleLabel(role) {
      const map = { 1: '超级管理员', 2: '家长', 3: '学生' };
      return map[role] || '未知角色';
    },
		gotoLogin () {
			uni.redirectTo({
				url: '../login/index'
			});
		},
		onChangePassword () {
			uni.reLaunch({
			  url: '/pages/login/password'
			})
		},
    onLogout() {
      return logout().then(() => {
        uni.reLaunch({
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