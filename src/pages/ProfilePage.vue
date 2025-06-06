<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="elevation-2">
          <v-card-title class="d-flex align-center pb-0">
            <div class="d-flex align-center flex-grow-1">
              <v-avatar size="80" class="mr-4">
                <v-img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.name || 'User avatar'"
                ></v-img>
                <v-icon v-else size="40" color="grey">mdi-account</v-icon>
              </v-avatar>
              <div>
                <h2 class="text-h5">{{ isEditing ? 'Edit Profile' : 'Profile' }}</h2>
                <p class="text-subtitle-1 text-medium-emphasis">Manage your account settings</p>
              </div>
            </div>
            <v-btn
              color="primary"
              variant="text"
              @click="toggleEdit"
            >
              {{ isEditing ? 'Cancel' : 'Edit Profile' }}
            </v-btn>
          </v-card-title>

          <v-divider class="my-4"></v-divider>

          <v-card-text>
            <v-form ref="form" @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.name"
                    label="Name"
                    :readonly="!isEditing"
                    variant="outlined"
                    :error-messages="nameErrors"
                    @input="validateName"
                    @blur="validateName"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.email"
                    label="Email"
                    :readonly="!isEditing"
                    variant="outlined"
                    :error-messages="emailErrors"
                    @input="validateEmail"
                    @blur="validateEmail"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.phone_number"
                    label="Phone Number"
                    :readonly="!isEditing"
                    variant="outlined"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.language"
                    label="Language"
                    :readonly="!isEditing"
                    variant="outlined"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="profileForm.timezone"
                    :items="timezones"
                    label="Timezone"
                    :readonly="!isEditing"
                    variant="outlined"
                  ></v-select>
                </v-col>

                <v-col v-if="isEditing" cols="12">
                  <v-file-input
                    v-model="profileForm.avatar"
                    label="Profile Picture"
                    accept="image/png,image/jpeg,image/jpg"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    :hint="avatarHint"
                    persistent-hint
                    @update:model-value="handleAvatarChange"
                  ></v-file-input>
                </v-col>

                <v-col v-if="isEditing && user.avatar_url" cols="12">
                  <v-checkbox
                    v-model="profileForm.remove_avatar"
                    label="Remove current profile picture"
                  ></v-checkbox>
                </v-col>

                <v-col v-if="isEditing" cols="12">
                  <v-divider class="mb-4"></v-divider>
                  <p class="text-subtitle-1 font-weight-medium mb-2">Change Password (Optional)</p>
                  <v-text-field
                    v-model="profileForm.password"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    class="mb-2"
                    :error-messages="passwordErrors"
                    @input="validatePassword"
                    @blur="validatePassword"
                  ></v-text-field>
                  <v-text-field
                    v-model="profileForm.password_confirmation"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    :error-messages="passwordConfirmationErrors"
                    @input="validatePasswordConfirmation"
                    @blur="validatePasswordConfirmation"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-card-actions v-if="isEditing" class="justify-end">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="!isFormValid || loading"
                >
                  Update Profile
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="3000"
        >
          {{ snackbar.text }}
          <template v-slot:actions>
            <v-btn
              variant="text"
              @click="snackbar.show = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAxios } from '@/composables/useAxios';
import moment from 'moment-timezone';

// Initialize API client
const { apiGet, apiPost, apiDelete, axiosInstance, handleApiError } = useAxios();

// Create a apiPut function since it's not in useAxios
const apiPut = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// State
const user = ref({});
const isEditing = ref(false);
const loading = ref(false);
const avatarPreview = ref(null);
const form = ref(null);
const nameErrors = ref([]);
const emailErrors = ref([]);
const passwordErrors = ref([]);
const passwordConfirmationErrors = ref([]);

// Form data
const profileForm = reactive({
  name: '',
  email: '',
  phone_number: '',
  language: '',
  timezone: '',
  avatar: null,
  remove_avatar: false,
  password: '',
  password_confirmation: ''
});

// Notification state
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

// List of timezones for the dropdown
const timezones = moment.tz.names().map(name => ({ 
  title: `${name} (${moment.tz(name).format('Z')})`, 
  value: name 
}));

// Avatar hint
const avatarHint = computed(() => {
  if (profileForm.avatar && profileForm.avatar.length > 0) {
    return `Selected: ${profileForm.avatar[0].name}`;
  }
  return 'Upload a profile picture (PNG, JPG formats only)';
});

// Validation computed property
const isFormValid = computed(() => {
  if (nameErrors.value.length > 0 || emailErrors.value.length > 0) {
    return false;
  }
  
  if (profileForm.password || profileForm.password_confirmation) {
    if (passwordErrors.value.length > 0 || passwordConfirmationErrors.value.length > 0) {
      return false;
    }
  }
  
  return profileForm.name && profileForm.email;
});

// Validation methods
const validateName = () => {
  nameErrors.value = [];
  if (!profileForm.name) {
    nameErrors.value.push('Name is required');
  }
};

const validateEmail = () => {
  emailErrors.value = [];
  if (!profileForm.email) {
    emailErrors.value.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
    emailErrors.value.push('Invalid email format');
  }
};

const validatePassword = () => {
  passwordErrors.value = [];
  if (profileForm.password && profileForm.password.length < 6) {
    passwordErrors.value.push('Password must be at least 6 characters');
  }
};

const validatePasswordConfirmation = () => {
  passwordConfirmationErrors.value = [];
  if (profileForm.password !== profileForm.password_confirmation) {
    passwordConfirmationErrors.value.push('Passwords do not match');
  }
};

// Handle avatar file change
const handleAvatarChange = (files) => {
  if (files && files.length > 0) {
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      snackbar.text = 'Profile picture must be less than 5MB';
      snackbar.color = 'error';
      snackbar.show = true;
      profileForm.avatar = null;
    }
  }
};

// Toggle edit mode
const toggleEdit = () => {
  if (isEditing.value) {
    // Reset form to original values
    resetForm();
  }
  isEditing.value = !isEditing.value;
};

// Reset form to original user values
const resetForm = () => {
  profileForm.name = user.value.name || '';
  profileForm.email = user.value.email || '';
  profileForm.phone_number = user.value.phone_number || '';
  profileForm.language = user.value.language || '';
  profileForm.timezone = user.value.timezone || '';
  profileForm.avatar = null;
  profileForm.remove_avatar = false;
  profileForm.password = '';
  profileForm.password_confirmation = '';
  
  // Clear validation errors
  nameErrors.value = [];
  emailErrors.value = [];
  passwordErrors.value = [];
  passwordConfirmationErrors.value = [];
};

// Fetch user profile data
const fetchProfile = async () => {
  loading.value = true;
  
  try {
    const response = await apiGet('/api/profile');
    if (response && response.user) {
      user.value = response.user;
      resetForm();
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    snackbar.text = 'Failed to load profile. Please try again.';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    loading.value = false;
  }
};

// Update user profile
const updateProfile = async () => {
  // Validate form fields
  validateName();
  validateEmail();
  if (profileForm.password) validatePassword();
  if (profileForm.password_confirmation) validatePasswordConfirmation();
  
  if (!isFormValid.value) {
    snackbar.text = 'Please correct the errors in the form';
    snackbar.color = 'error';
    snackbar.show = true;
    return;
  }
  
  loading.value = true;
  
  try {
    console.log('Starting profile update');
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('user[name]', profileForm.name);
    formData.append('user[email]', profileForm.email);
    formData.append('user[phone_number]', profileForm.phone_number || '');
    formData.append('user[language]', profileForm.language || '');
    formData.append('user[timezone]', profileForm.timezone || '');
    formData.append('user[remove_avatar]', profileForm.remove_avatar ? '1' : '0');
    
    // Log FormData entries (can't directly log FormData object)
    for (let [key, value] of formData.entries()) {
      console.log(`FormData: ${key} = ${value}`);
    }
    
    if (profileForm.avatar && profileForm.avatar.length > 0) {
      const file = profileForm.avatar[0];
      console.log(`Adding avatar: ${file.name}, size: ${file.size}, type: ${file.type}`);
      formData.append('user[avatar]', file);
    }
    
    if (profileForm.password) {
      console.log('Adding password fields');
      formData.append('user[password]', profileForm.password);
      formData.append('user[password_confirmation]', profileForm.password_confirmation);
    }
    
    console.log('Sending PUT request to /api/profile');
    
    // Try with patch method first (Rails uses patch for updates by default)
    try {
      const response = await axiosInstance.patch('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Profile updated successfully', response.data);
      
      if (response.data && response.data.user) {
        user.value = response.data.user;
        snackbar.text = 'Profile updated successfully';
        snackbar.color = 'success';
        snackbar.show = true;
        isEditing.value = false;
      }
    } catch (patchError) {
      console.error('PATCH request failed, trying PUT as fallback', patchError);
      
      // If patch fails, try put as fallback
      const response = await apiPut('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('PUT request succeeded', response);
      
      if (response && response.user) {
        user.value = response.user;
        snackbar.text = 'Profile updated successfully';
        snackbar.color = 'success';
        snackbar.show = true;
        isEditing.value = false;
      }
    }
  } catch (error) {
    console.error('Failed to update profile:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    
    const errorMessage = error.response?.data?.errors?.join(', ') || 
                         error.response?.data?.status?.message || 
                         'Failed to update profile. Please try again.';
    snackbar.text = errorMessage;
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    loading.value = false;
  }
};

// Initialize component
onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.5);
}
</style> 