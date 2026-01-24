import { createStore } from 'vuex'
import { USE_MOCK_KEY } from '@/utils/variables.js'
import { getCategoryEnum } from '@/api'

export default createStore({
  state: {
    isUseMock: false,
    userInfo: null,
    activeTabKey: 'index',
    categoryEnum: null
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
    },
    setCategoryEnum(state, data) {
      state.categoryEnum = data
    }
  },
  actions: {
    getCategoryEnum ({ state, commit }, categoryId) {
      if (state.categoryEnum) {
        return Promise.resolve(state.categoryEnum)
      }
      return getCategoryEnum(categoryId).then(data => {
        commit('setCategoryEnum', data)
      })
    }
  }
})