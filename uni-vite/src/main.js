import { createSSRApp } from "vue";
import App from "./App.vue";
import './uni.promisify.adaptor';

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}