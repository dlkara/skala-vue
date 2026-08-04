import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// mount 전에 플러그인 등록
app.use(createPinia())
app.use(router)

app.mount('#app')
