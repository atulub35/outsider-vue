<template>
  <v-app>
    <AppNavbar />
    <v-main class="main-content">
      <router-view></router-view>
    </v-main>
    <AppBottomNav v-if="showBottomNav" />
  </v-app>
</template>

<script setup>
import { onMounted, computed, defineAsyncComponent } from 'vue'
import { useTheme } from 'vuetify'
import { useRoute } from 'vue-router'
// Use async component loading for better code splitting
const AppNavbar = defineAsyncComponent(() => import('@/components/AppNavbar.vue'))
const AppBottomNav = defineAsyncComponent(() => import('./components/AppBottomNav.vue'))

const theme = useTheme()
const route = useRoute()

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }
})

// Don't show bottom nav on login and register pages
const showBottomNav = computed(() => {
  return !['login', 'register'].includes(route.name)
})
</script>

<style>
.v-application {
  transition: background-color 0.3s ease;
}

.main-content {
  padding-bottom: 56px; /* Height of bottom navigation */
}
</style>
