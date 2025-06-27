import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuth } from './stores/auth'

// Återställ användare från localStorage
const { restoreUser } = useAuth()
restoreUser()

createApp(App).use(router).mount('#app')
