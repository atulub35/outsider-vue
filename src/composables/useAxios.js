import { ref } from 'vue'
import axios from 'axios'

export function useAxios() {
  const showError = ref(false)
  const errorMessage = ref('')

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === "production"
    ? "https://outsider-284373f8936c.herokuapp.com"
    : "http://localhost:3001",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  // Add request interceptor to add auth token and CSRF token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }

      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }

      // Log outgoing requests for debugging
      console.log('Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      })
      return config
    },
    (error) => {
      console.error('Request Error:', error)
      return Promise.reject(error)
    }
  )

  // Add response interceptor to handle common errors
  axiosInstance.interceptors.response.use(
    (response) => {
      // Log successful responses for debugging
      console.log('Response:', {
        status: response.status,
        data: response.data
      })
      return response
    },
    (error) => {
      // Enhanced error logging
      console.error('Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })

      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      } else if (!error.response) {
        // Network error or server not reachable
        errorMessage.value = 'Unable to reach the server. Please check your connection.'
        showError.value = true
      }
      return Promise.reject(error)
    }
  )

  // Helper method to handle API errors
  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error)
    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = defaultMessage
    }
    showError.value = true
    return Promise.reject(error)
  }

  // Helper method for GET requests
  const apiGet = async (url, config = {}) => {
    try {
      const response = await axiosInstance.get(url, config)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Helper method for POST requests
  const apiPost = async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.post(url, data, config)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Helper method for DELETE requests
  const apiDelete = async (url, config = {}) => {
    try {
      const response = await axiosInstance.delete(url, config)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  return {
    axiosInstance,
    apiGet,
    apiPost,
    apiDelete,
    handleApiError,
    showError,
    errorMessage
  }
} 