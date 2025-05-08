<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Sign In</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                label="Email Address"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="[rules.required, rules.email]"
                required
                autocomplete="email"
                autofocus
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[rules.required]"
                required
                autocomplete="current-password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              @click="handleLogin" 
              :loading="loading"
              :disabled="loading"
              block
            >
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </v-btn>
          </v-card-actions>
          <v-card-text class="text-center">
            <router-link to="/register" class="text-decoration-none">
              Don't have an account? Sign up
            </router-link>
          </v-card-text>
          <v-snackbar v-model="snackbar" :color="snackbarColor">
            {{ snackbarText }}
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAxios } from '@/composables/useAxios'

const router = useRouter()
const { apiPost, showError, errorMessage } = useAxios()
const form = ref(null)
const loading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const email = ref('')
const password = ref('')

const rules = {
  required: value => !!value || 'Required.',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Invalid e-mail.'
  }
}

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true
  try {
    const response = await apiPost('/users/sign_in', {
      user: {
        email: email.value,
        password: password.value
      }
    })

    // Store the authentication token if provided
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }

    snackbarColor.value = 'success'
    snackbarText.value = 'Login successful!'
    snackbar.value = true

    // Redirect to home page
    router.push('/')
  } catch (error) {
    snackbarColor.value = 'error'
    snackbarText.value = error.response?.data?.error || 'Login failed. Please try again.'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  max-width: 500px;
  margin: 0 auto;
}
</style> 