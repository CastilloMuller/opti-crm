import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// PrimeVue Styles
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// Create app
const app = createApp(App)

// Error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Error Info:', info)
}

window.onerror = function(msg, url, line, col, error) {
  console.error('Global Error:', {
    message: msg,
    url: url,
    line: line,
    col: col,
    error: error
  })
  return false
}

// Use plugins
app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)

// Mount app
app.mount('#app')
