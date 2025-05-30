/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
// Only import essential components initially
// Replace direct imports with dynamic imports
// import * as components from 'vuetify/components'
// import * as directives from 'vuetify/directives'

// Styles - removed local font imports
// import 'unfonts.css'
// import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  // Use on-demand importing of components and directives
  components: {
    // Import only the essential components that are used on the initial page load
    // Other components will be loaded dynamically when needed
  },
  directives: {
    // Import only essential directives
  },
  theme: {
    defaultTheme: 'light',
    // Set Inter as the default font
    themes: {
      light: {
        fontFamily: 'Inter, sans-serif',
      },
      dark: {
        fontFamily: 'Inter, sans-serif',
      }
    }
  }
})

const app = createApp(App)

app.use(router)
app.use(vuetify)

registerPlugins(app)

app.mount('#app')
