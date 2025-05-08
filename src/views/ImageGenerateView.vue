<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <v-card class="image-generate-card">
          <v-card-title class="d-flex align-center">
            <v-icon start>mdi-image-edit</v-icon>
            Image Generation
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="generateImage" ref="form">
              <!-- Image Upload (Optional) -->
              <v-file-input
                v-model="imageFile"
                accept="image/*"
                label="Upload Reference Image (Optional)"
                prepend-icon="mdi-camera"
                :loading="uploading"
                :disabled="uploading"
                :error-messages="imageError"
                @change="handleImageChange"
                class="mb-4"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="(fileName, index) in fileNames" :key="index">
                    <v-chip
                      size="small"
                      label
                      color="primary"
                      class="me-2"
                    >
                      {{ fileName }}
                    </v-chip>
                  </template>
                </template>
              </v-file-input>

              <!-- Image Preview -->
              <v-img
                v-if="imagePreview"
                :src="imagePreview"
                max-height="300"
                class="mb-4 rounded-lg"
                cover
              ></v-img>

              <!-- Description Input -->
              <v-textarea
                v-model="description"
                label="Image Description"
                placeholder="Describe what you want to generate..."
                :loading="generating"
                :disabled="generating"
                :error-messages="descriptionError"
                rows="3"
                auto-grow
                class="mb-4"
              ></v-textarea>

              <!-- Generate Button -->
              <v-btn
                color="primary"
                block
                :loading="generating"
                :disabled="!isFormValid || generating"
                @click="generateImage"
                class="mb-4"
              >
                <v-icon start>mdi-wand</v-icon>
                Generate Image
              </v-btn>
            </v-form>

            <!-- Generated Images -->
            <div v-if="images.length > 0" class="mt-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">Your Images</h3>
                <v-btn
                  icon
                  variant="text"
                  color="primary"
                  @click="loadImages"
                  :loading="loading"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
              <v-row>
                <v-col
                  v-for="image in images"
                  :key="image.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card>
                    <v-img
                      :src="image.image_url"
                      height="200"
                      cover
                      class="align-end"
                      :loading="image.loading"
                      :error="image.error"
                    >
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="primary"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                      <template v-slot:error>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-icon color="error">mdi-alert-circle</v-icon>
                          <span class="ml-2">Failed to load image</span>
                        </v-row>
                      </template>
                      <v-card-title class="text-white text-shadow">
                        {{ image.description }}
                      </v-card-title>
                    </v-img>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        icon
                        variant="text"
                        color="error"
                        @click="deleteImage(image.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        color="primary"
                        @click="downloadImage(image.image_url)"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showError = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAxios } from '@/composables/useAxios'

const { apiGet, apiPost, apiDelete, axiosInstance, showError, errorMessage } = useAxios()

const form = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const description = ref('')
const uploading = ref(false)
const generating = ref(false)
const loading = ref(false)
const images = ref([])
const imageError = ref('')
const descriptionError = ref('')

const isFormValid = computed(() => {
  return description.value.trim().length > 0 // Only require description
})

const handleImageChange = (file) => {
  imageError.value = ''
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      imageError.value = 'Image size should be less than 5MB'
      imageFile.value = null
      imagePreview.value = null
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}

const loadImages = async () => {
  loading.value = true
  try {
    const response = await apiGet('/images')
    images.value = response.map(image => ({
      ...image,
      loading: true,
      error: false
    }))
  } catch (error) {
    // Error is already handled by the composable
  } finally {
    loading.value = false
  }
}

const generateImage = async () => {
  if (!isFormValid.value) return

  uploading.value = true
  generating.value = true
  const formData = new FormData()
  
  // Only append image if it exists
  if (imageFile.value) {
    formData.append('reference_image', imageFile.value)
  }
  formData.append('prompt', description.value)

  try {
    const response = await apiPost('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Add the new image to the list with loading state
    images.value.unshift({
      ...response,
      loading: true,
      error: false
    })

    // Reset form
    imageFile.value = null
    imagePreview.value = null
    description.value = ''
    form.value?.reset()
  } catch (error) {
    // Error is already handled by the composable
  } finally {
    uploading.value = false
    generating.value = false
  }
}

const deleteImage = async (id) => {
  if (!confirm('Are you sure you want to delete this image?')) return

  try {
    await apiDelete(`/images/${id}`)
    images.value = images.value.filter(img => img.id !== id)
  } catch (error) {
    // Error is already handled by the composable
  }
}

const downloadImage = async (url) => {
  try {
    const response = await axiosInstance.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `generated-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    errorMessage.value = 'Failed to download image'
    showError.value = true
  }
}

// Load images on component mount
onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.image-generate-card {
  max-width: 800px;
  margin: 0 auto;
}

.text-shadow {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .v-card {
    background-color: rgb(var(--v-theme-surface));
  }
}
</style> 