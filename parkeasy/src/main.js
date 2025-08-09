// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


import PrimeVue from 'primevue/config'


import Aura from '@primevue/themes/aura'

import 'primeicons/primeicons.css'



const app = createApp(App)


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

app.use(createPinia())
app.use(router)

app.mount('#app')


