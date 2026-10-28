import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { reportApiFailure } from './lib/apiFailure'
import { registerServiceWorker } from './pwa'
import router from './router'
import './style.css'

registerServiceWorker()

const app = createApp(App)

app.config.errorHandler = () => {
  reportApiFailure('')
}

app.use(createPinia())
app.use(router)
app.mount('#app')
