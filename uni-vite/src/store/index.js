import { createStore } from 'vuex'

export default createStore({
  state: {
    activeTabBar: 'home'
  },
  mutations: {
    setActiveTabBar(state, str) {
      state.activeTabBar = str
    }
  }
})