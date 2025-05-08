<template>
  <v-app-bar color="primary" dark>
    <v-app-bar-title>
      <router-link to="/" class="text-decoration-none text-white">
        Outsider
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Theme Toggle -->
    <v-btn icon @click="toggleTheme">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <!-- Navigation Links -->
    <v-btn v-if="isAuthenticated" to="/chat" icon>
      <v-icon>mdi-chat</v-icon>
    </v-btn>

    <v-btn v-if="isAuthenticated" @click="handleLogout" icon>
      <v-icon>mdi-logout</v-icon>
    </v-btn>

    <v-btn v-else to="/login" icon>
      <v-icon>mdi-login</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import axios from 'axios'

const router = useRouter()
const theme = useTheme()
const isDark = ref(theme.global.current.value.dark)

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('auth_token')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const handleLogout = async () => {
  try {
    await axios.delete('/users/sign_out')
    localStorage.removeItem('auth_token')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    theme.global.name.value = savedTheme
  }
})
</script>

<style scoped>
.v-app-bar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 