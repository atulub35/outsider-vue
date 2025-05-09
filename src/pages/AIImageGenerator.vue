<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">AI Image Generator</h1>
        
        <!-- Safety Check Alert -->
        <v-alert
          v-if="safetyCheckFailed"
          type="warning"
          class="mb-6"
          closable
          @click:close="safetyCheckFailed = false"
        >
          {{ safetyCheckMessage }}
        </v-alert>

        <!-- Tabs -->
        <v-tabs v-model="activeTab" class="mb-6">
          <v-tab value="generate">Text to Image</v-tab>
          <v-tab value="edit">Image to Image</v-tab>
        </v-tabs>

        <!-- Generate Image Form -->
        <v-window v-model="activeTab">
          <v-window-item value="generate">
            <v-card class="pa-6">
              <v-form @submit.prevent="generateImage">
                <v-textarea
                  v-model="generateForm.prompt"
                  label="Prompt"
                  rows="3"
                  placeholder="Describe the image you want to generate..."
                  variant="outlined"
                  class="mb-4"
                  :rules="[v => !!v || 'Prompt is required']"
                  required
                ></v-textarea>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="generateForm.width"
                      label="Width"
                      type="number"
                      variant="outlined"
                      min="320"
                      max="1536"
                      step="64"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="generateForm.height"
                      label="Height"
                      type="number"
                      variant="outlined"
                      min="320"
                      max="1536"
                      step="64"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="generateForm.cfg_scale"
                      label="CFG Scale"
                      type="number"
                      variant="outlined"
                      min="1"
                      max="20"
                      step="0.5"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="generateForm.steps"
                      label="Steps"
                      type="number"
                      variant="outlined"
                      min="10"
                      max="50"
                      step="1"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="isGenerating"
                  :disabled="isGenerating || !generateForm.prompt"
                >
                  {{ isGenerating ? 'Generating...' : 'Generate Image' }}
                </v-btn>
              </v-form>
            </v-card>
          </v-window-item>

          <!-- Edit Image Form -->
          <v-window-item value="edit">
            <v-card class="pa-6">
              <v-form @submit.prevent="editImage">
                <v-textarea
                  v-model="editForm.prompt"
                  label="Prompt"
                  rows="3"
                  placeholder="Describe how you want to edit the image..."
                  variant="outlined"
                  class="mb-4"
                  :rules="[v => !!v || 'Prompt is required']"
                  required
                ></v-textarea>

                <v-file-input
                  v-model="editForm.image"
                  label="Upload Image (Optional)"
                  accept="image/*"
                  variant="outlined"
                  class="mb-4"
                  @change="handleImageUpload"
                  :hint="editForm.image ? 'Image uploaded' : 'Upload an image to modify it, or leave empty to generate from text only'"
                  persistent-hint
                ></v-file-input>

                <v-row v-if="editForm.image">
                  <v-col cols="12" sm="6">
                    <v-slider
                      v-model="editForm.image_strength"
                      label="Image Strength"
                      min="0"
                      max="1"
                      step="0.05"
                      thumb-label
                      :hint="'Higher values preserve more of the original image'"
                      persistent-hint
                    ></v-slider>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.cfg_scale"
                      label="CFG Scale"
                      type="number"
                      variant="outlined"
                      min="1"
                      max="20"
                      step="0.5"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.width"
                      label="Width"
                      type="number"
                      variant="outlined"
                      min="320"
                      max="1536"
                      step="64"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.height"
                      label="Height"
                      type="number"
                      variant="outlined"
                      min="320"
                      max="1536"
                      step="64"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-switch
                  v-model="editForm.safety_checker"
                  label="Enable Safety Checker"
                  color="primary"
                  class="mb-4"
                  :hint="'Prevents generation of inappropriate content'"
                  persistent-hint
                ></v-switch>

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="isEditing"
                  :disabled="isEditing || !editForm.prompt"
                >
                  {{ isEditing ? 'Processing...' : (editForm.image ? 'Edit Image' : 'Generate Image') }}
                </v-btn>
              </v-form>
            </v-card>
          </v-window-item>
        </v-window>

        <!-- Results -->
        <v-row v-if="generatedImages.length > 0" class="mt-6">
          <v-col cols="12">
            <h2 class="text-h5 mb-4">Generated Images</h2>
          </v-col>
          <v-col
            v-for="(image, index) in generatedImages"
            :key="index"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card>
              <v-img
                :src="'data:image/png;base64,' + image.base64"
                :alt="'Generated image ' + (index + 1)"
                height="300"
                cover
              ></v-img>
              <v-card-actions>
                <v-btn
                  color="primary"
                  block
                  @click="downloadImage(image.base64, 'generated-image-' + (index + 1))"
                >
                  Download
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const activeTab = ref('generate')
const isGenerating = ref(false)
const isEditing = ref(false)
const generatedImages = ref([])
const safetyCheckFailed = ref(false)
const safetyCheckMessage = ref('')
const error = ref(null)

const generateForm = reactive({
  prompt: '',
  width: 512,
  height: 512,
  cfg_scale: 7,
  steps: 30,
  samples: 1
})

const editForm = reactive({
  image: null,
  prompt: '',
  image_strength: 0.35,
  cfg_scale: 7,
  steps: 30,
  samples: 1,
  width: 512,
  height: 512
})

const handleImageUpload = (event) => {
  if (event.target.files && event.target.files[0]) {
    editForm.image = event.target.files[0]
  }
}

const generateImage = async () => {
  try {
    isGenerating.value = true
    error.value = null
    safetyCheckFailed.value = false
    safetyCheckMessage.value = ''

    const response = await axios({
      method: 'post',
      url: 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer sk-h4QbQ0KogqDZiataqDQTssRonjufHfEcevJ8fneU6oyelI4R'
      },
      data: {
        text_prompts: [
          {
            text: generateForm.prompt,
            weight: 1
          }
        ],
        cfg_scale: generateForm.cfg_scale,
        height: generateForm.height,
        width: generateForm.width,
        samples: generateForm.samples,
        steps: generateForm.steps
      }
    })

    if (response.data.safety_checker?.flagged) {
      safetyCheckFailed.value = true
      safetyCheckMessage.value = response.data.safety_checker.message
      return
    }

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      generatedImages.value = response.data.artifacts
    }
  } catch (err) {
    console.error('Generate Image Error:', err)
    if (err.response?.data?.name === 'content_moderation') {
      safetyCheckFailed.value = true
      safetyCheckMessage.value = err.response.data.message
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to generate image'
    }
  } finally {
    isGenerating.value = false
  }
}

const editImage = async () => {
  try {
    isEditing.value = true
    error.value = null
    safetyCheckFailed.value = false
    safetyCheckMessage.value = ''

    if (!editForm.image) {
      error.value = 'Please select an image first'
      return
    }

    const formData = new FormData()
    formData.append('init_image', editForm.image)
    formData.append('text_prompts[0][text]', editForm.prompt)
    formData.append('text_prompts[0][weight]', '1')
    formData.append('image_strength', editForm.image_strength.toString())
    formData.append('cfg_scale', editForm.cfg_scale.toString())
    formData.append('samples', editForm.samples.toString())
    formData.append('steps', editForm.steps.toString())

    const response = await axios({
      method: 'post',
      url: 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer sk-h4QbQ0KogqDZiataqDQTssRonjufHfEcevJ8fneU6oyelI4R'
      },
      data: formData
    })

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      generatedImages.value = response.data.artifacts
    }
  } catch (err) {
    console.error('Edit Image Error:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to edit image'
  } finally {
    isEditing.value = false
  }
}

const downloadImage = (base64, filename) => {
  const link = document.createElement('a')
  link.href = 'data:image/png;base64,' + base64
  link.download = filename + '.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.ai-image-generator {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style> 