import { createStore } from 'vuex'

export default createStore({
  state: {
    activeTabKey: 'index'
  },
  mutations: {
    setActiveTabKey(state, str) {
      state.activeTabKey = str
    }
  }
})