<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h3">AI Image Generator</h1>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="tab = 'generate'"
            v-if="tab === 'gallery'"
          >
            <v-icon start>mdi-plus</v-icon>
            Generate Image
          </v-btn>
          <v-btn 
            color="secondary" 
            variant="flat" 
            @click="tab = 'gallery'"
            v-if="tab === 'generate'"
          >
            <v-icon start>mdi-image-multiple</v-icon>
            View Gallery
          </v-btn>
        </div>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-6"
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-card v-if="tab === 'generate'" class="mb-6">
          <v-card-title class="text-h5 py-4">
            Generate Image with DALL-E 3
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="generateImage">
              <v-textarea
                v-model="form.prompt"
                label="Describe your image"
                placeholder="Example: A serene Japanese garden with cherry blossoms, digital art style"
                variant="outlined"
                rows="3"
                :error-messages="promptErrors"
                required
                :disabled="isLoading"
                class="mb-4"
                @input="validatePrompt"
                @blur="validatePrompt"
              ></v-textarea>

              <v-expansion-panels variant="accordion" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                      Example Prompts
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-chip-group>
                      <v-chip
                        v-for="(prompt, i) in examplePrompts"
                        :key="i"
                        color="primary"
                        variant="outlined"
                        @click="useExamplePrompt(prompt)"
                        class="ma-1"
                      >
                        {{ prompt.label }}
                      </v-chip>
                    </v-chip-group>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-card-actions class="pb-0 px-0">
                <v-spacer></v-spacer>
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="isLoading"
                  :disabled="!isFormValid || isLoading"
                >
                  <v-icon start>mdi-creation</v-icon>
                  Generate Image
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Recently Generated Image -->
        <v-card v-if="tab === 'generate' && generatedImage" class="mb-6">
          <v-card-title class="text-h5 py-4">
            Generated Image
          </v-card-title>
          
          <v-card-text class="text-center">
            <v-img
              :src="generatedImage.image_url"
              max-height="600"
              contain
              class="mb-4"
            ></v-img>
            
            <p class="text-body-1 text-medium-emphasis mb-2">
              {{ generatedImage.prompt }}
            </p>
            
            <v-btn
              color="primary"
              variant="text"
              :href="generatedImage.image_url"
              target="_blank"
              prepend-icon="mdi-download"
              class="mt-2"
            >
              Download Image
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Image Gallery Tab -->
        <div v-if="tab === 'gallery'">
          <v-card class="mb-6" variant="flat">
            <v-card-title class="text-h5 py-4">
              Your Image Gallery
            </v-card-title>
          </v-card>
          
          <ImageGallery 
            :images="images" 
            :loading="isLoadingGallery"
            @refresh="fetchImages"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ImageGallery from '@/components/ImageGallery.vue';
import { useAxios } from '@/composables/useAxios';

// Setup API client
const { apiGet, apiPost, apiDelete, errorMessage, showError } = useAxios();

// State
const tab = ref('generate');
const form = ref({
  prompt: ''
});
const promptErrors = ref([]);
const images = ref([]);
const generatedImage = ref(null);
const isLoading = ref(false);
const isLoadingGallery = ref(false);
const error = ref(null);

// Computed property for form validity
const isFormValid = computed(() => {
  return form.value.prompt.trim() !== '' && promptErrors.value.length === 0;
});

// Example prompts
const examplePrompts = [
  { label: 'Magical Forest', text: 'A magical forest at night with glowing mushrooms and fireflies, fantasy art style' },
  { label: 'Futuristic City', text: 'A futuristic cityscape with flying cars and neon lights, cyberpunk style' },
  { label: 'Beach Sunset', text: 'A peaceful beach sunset with palm trees and gentle waves, watercolor style' },
  { label: 'Mountain Landscape', text: 'A majestic mountain landscape with snow peaks and a lake reflection, oil painting style' },
  { label: 'Space Station', text: 'An orbital space station with Earth in the background, digital art' }
];

// Validation methods
const validatePrompt = () => {
  promptErrors.value = [];
  if (!form.value.prompt || form.value.prompt.trim() === '') {
    promptErrors.value.push('Prompt is required');
  }
};

// Methods
const useExamplePrompt = (prompt) => {
  form.value.prompt = prompt.text;
  validatePrompt();
};

const fetchImages = async () => {
  isLoadingGallery.value = true;
  error.value = null;
  
  try {
    const response = await apiGet('/api/images');
    if (response && response.data && response.data.images) {
      images.value = response.data.images;
    }
  } catch (err) {
    console.error('Error fetching images:', err);
    error.value = 'Failed to load images. Please try again later.';
  } finally {
    isLoadingGallery.value = false;
  }
};

const generateImage = async () => {
  // Manual validation
  validatePrompt();
  
  if (!isFormValid.value) {
    error.value = 'Please provide a description for your image';
    return;
  }
  
  isLoading.value = true;
  error.value = null;

  try {
    const response = await apiPost('/api/images', { prompt: form.value.prompt });
    
    if (response && response.data) {
      generatedImage.value = response.data;
      // Refresh gallery data after generating a new image
      fetchImages();
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    console.error('Error generating image:', err);
    const errorMsg = err.response?.data?.status?.message || 'Failed to generate image. Please try again.';
    error.value = errorMsg;
  } finally {
    isLoading.value = false;
  }
};

// Initialize validation on mount
onMounted(() => {
  fetchImages();
  validatePrompt();
});
</script>

<style scoped>
.ai-image-generator {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style> 