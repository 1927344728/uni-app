import { createStore } from 'vuex'

export default createStore({
  state: {
    isUseMock: true,
    activeTabKey: 'index'
  },
  mutations: {
    setActiveTabKey(state, str) {
      state.activeTabKey = str
    }
  }
})