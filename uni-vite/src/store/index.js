import { createStore } from 'vuex'
import { scaleImageWidthInCOS } from '@/utils/common.js'

export default createStore({
  state: {
    isUseMock: true,
    userInfo: null,
    activeTabKey: 'index'
  },
  mutations: {
    setIsUseMock (state, bool) {
      state.isUseMock = bool
    },
    setUserInfo (state, data) {
      if (data && state.userInfo) {
        for (const k in data) {
          state.userInfo[k] = data[k]
        }
        return
      }
      state.userInfo = data || null
    },
    setActiveTabKey(state, str) {
      state.activeTabKey = str
    }
  }
})