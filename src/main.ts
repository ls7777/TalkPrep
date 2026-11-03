import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './styles/tokens.css'
import './styles/main.css'
import './styles/daily.css'

createApp(App).use(router).mount('#app')
