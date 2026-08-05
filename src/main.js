import './assets/main.css'
import './assets/common.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// mount 전에 플러그인 등록
app.use(pinia)
app.use(router)

app.mount('#app')
