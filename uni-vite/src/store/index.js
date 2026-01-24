import { createStore } from 'vuex'
import { get as _get } from 'lodash'
import { USE_MOCK_KEY } from '@/utils'
import { getCategoryEnum } from '@/api'

const mockState = uni.getStorageSync(USE_MOCK_KEY)
const isUseMock = mockState && (_get(mockState, 'value') === 1 && new Date().getTime() - _get(mockState, 'timestamp') <= 3 * 24 * 60 * 60 * 1000)
export default createStore({
  state: {
    isUseMock,
    userInfo: null,
    activeTabKey: 'index',
    categoryEnum: null
  },
  mutations: {
    setIsUseMock (state, bool) {
      state.isUseMock = bool
      uni.setStorageSync(USE_MOCK_KEY, {
        value: bool ? 1 : 0,
        timestamp: new Date().getTime()
      })
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