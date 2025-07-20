import { createStore } from 'vuex'

export default createStore({
  state: {
    activeTabBar: 'index'
  },
  mutations: {
    setActiveTabBar(state, str) {
      state.activeTabBar = str
    }
  }
})