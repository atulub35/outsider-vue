<template>
  <v-bottom-navigation
    v-model="active"
    :bg-color="color"
    color="white"
    mode="shift"
    grow
    class="bottom-nav"
  >
    <v-btn value="home" to="/">
      <v-icon>mdi-home</v-icon>
      <span>Home</span>
    </v-btn>

    <v-btn value="chat" to="/chat">
      <v-icon>mdi-chat</v-icon>
      <span>AI Chat</span>
    </v-btn>

    <v-btn value="generate-image" to="/generate-image">
      <v-icon>mdi-image-edit</v-icon>
      <span>Generate</span>
    </v-btn>

    <v-btn value="profile" to="/profile">
      <v-icon>mdi-account</v-icon>
      <span>Profile</span>
    </v-btn>
  </v-bottom-navigation>
  
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref('home')
const color = computed(() => {
  switch (active.value) {
    case 'home': return 'blue-grey'
    case 'chat': return 'teal'
    case 'generate-image': return 'brown'
    case 'profile': return 'indigo'
    default: return 'blue-grey'
  }
})
  
// Update active tab based on current route
watch(() => route.path, (newPath) => {
  if (newPath === '/') active.value = 'home'
  else if (newPath === '/chat') active.value = 'chat'
  else if (newPath === '/generate-image') active.value = 'generate-image'
  else if (newPath === '/profile') active.value = 'profile'
}, { immediate: true })
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style> 