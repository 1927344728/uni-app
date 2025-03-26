import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		activeTabBar: 'home'
	},
	mutations: {
		setActiveTabBar (state, str) {
			state.activeTabBar = str
		}
	}
})