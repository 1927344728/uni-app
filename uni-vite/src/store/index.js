import { createStore } from 'vuex'

export default createStore({
  state: {
    isUseMock: true,
    activeTabKey: 'index'
  },
  mutations: {
    setIsUseMock (state, bool) {
      state.isUseMock = bool
    },
    setActiveTabKey(state, str) {
      state.activeTabKey = str
    }
  }
})