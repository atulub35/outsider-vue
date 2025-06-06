<template>
  <div>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-3">Loading your images...</p>
      </v-col>
    </v-row>
    
    <v-row v-else-if="images.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert
          type="info"
          border="left"
          prominent
        >
          You haven't generated any images yet. Start by creating your first AI-generated image!
        </v-alert>
      </v-col>
    </v-row>
    
    <v-row v-else>
      <v-col
        v-for="image in images"
        :key="image.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="mb-4"
      >
        <v-card>
          <v-img
            :src="image.image_url"
            :alt="image.prompt"
            height="250"
            cover
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
          
          <v-card-text>
            <p class="text-truncate" :title="image.prompt">{{ image.prompt }}</p>
            <p class="text-caption text-grey">{{ formatDate(image.created_at) }}</p>
          </v-card-text>
          
          <v-card-actions>
            <v-btn
              density="comfortable"
              color="primary"
              variant="text"
              :href="image.image_url"
              target="_blank"
              prepend-icon="mdi-open-in-new"
            >
              View
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              density="comfortable"
              color="error"
              variant="text"
              prepend-icon="mdi-delete"
              @click="confirmDelete(image)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Image</v-card-title>
        <v-card-text>
          Are you sure you want to delete this image? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            variant="text" 
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="text" 
            @click="deleteImage"
            :loading="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAxios } from '@/composables/useAxios';

const { apiDelete } = useAxios();

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['refresh']);

const deleteDialog = ref(false);
const isDeleting = ref(false);
const imageToDelete = ref(null);

const confirmDelete = (image) => {
  imageToDelete.value = image;
  deleteDialog.value = true;
};

const deleteImage = async () => {
  if (!imageToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    await apiDelete(`/api/images/${imageToDelete.value.id}`);
    emit('refresh');
    
    // Show success message or notification here if needed
  } catch (error) {
    console.error('Failed to delete image:', error);
    // Show error message or notification here if needed
  } finally {
    isDeleting.value = false;
    deleteDialog.value = false;
    imageToDelete.value = null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
</script> 