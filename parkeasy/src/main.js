// src/main.js
/**
 * Vue App Entry Point
 * - Creates and mounts the main Vue application
 * - Configures PrimeVue with Aura theme
 * - Registers global plugins: Pinia (state) and Router (routing)
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

// Create Vue app instance
const app = createApp(App)

// Configure PrimeVue with Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none',

      cssLayer: {
        name: 'primevue',
        order: 'app-styles, primevue'
      }
    }
  }
})

// Register global plugins
app.use(createPinia())
app.use(router)

// Mount app to #app in index.html
app.mount('#app')


