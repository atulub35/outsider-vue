<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col cols="12" class="d-flex flex-column">
        <v-card class="flex-grow-1 d-flex flex-column">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>AI Chat</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="clearChat" :disabled="loading">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-toolbar>

          <!-- Chat Messages -->
          <v-card-text class="flex-grow-1 overflow-y-auto" ref="chatContainer">
            <v-container class="pa-4">
              <!-- Initial Loading State -->
              <template v-if="initialLoading">
                <div v-for="n in 3" :key="n" class="mb-4">
                  <v-row :justify="n % 2 === 0 ? 'end' : 'start'">
                    <v-col cols="auto">
                      <v-skeleton-loader
                        type="chip"
                        class="mb-2"
                        :width="n % 2 === 0 ? '60' : '40'"
                      ></v-skeleton-loader>
                      <v-skeleton-loader
                        type="card"
                        class="message-skeleton"
                        :width="n % 2 === 0 ? '300' : '400'"
                        height="80"
                      ></v-skeleton-loader>
                    </v-col>
                  </v-row>
                </div>
              </template>

              <!-- Empty State -->
              <div v-else-if="messages.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey">mdi-chat-outline</v-icon>
                <div class="text-h6 mt-4">No messages yet</div>
                <div class="text-body-2 text-grey">Start a conversation with AI</div>
              </div>

              <!-- Messages -->
              <template v-else>
                <div v-for="(message, index) in messages" :key="message.id" class="mb-4">
                  <v-row :justify="message.role === 'user' ? 'end' : 'start'">
                    <v-col cols="auto" :class="{ 'text-right': message.role === 'user' }">
                      <v-chip
                        :color="message.role === 'user' ? 'primary' : 'grey'"
                        :text-color="message.role === 'user' ? 'white' : 'black'"
                        class="mb-2"
                      >
                        {{ message.role === 'user' ? 'You' : 'AI' }}
                      </v-chip>
                      <div
                        :class="[
                          'message-bubble pa-3 rounded-lg',
                          message.role === 'user' ? 'user-message' : 'ai-message'
                        ]"
                      >
                        {{ message.content }}
                      </div>
                      <div class="text-caption mt-1" :class="{ 'text-right': message.role === 'user' }">
                        {{ formatTime(message.created_at) }}
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <!-- Message Loading State -->
                <div v-if="loading" class="mb-4">
                  <v-row justify="start">
                    <v-col cols="auto">
                      <v-skeleton-loader
                        type="chip"
                        class="mb-2"
                        width="40"
                      ></v-skeleton-loader>
                      <v-skeleton-loader
                        type="card"
                        class="message-skeleton"
                        width="400"
                        height="80"
                      ></v-skeleton-loader>
                    </v-col>
                  </v-row>
                </div>
              </template>
            </v-container>
          </v-card-text>

          <!-- Input Area -->
          <v-card-actions class="pa-4">
            <v-form @submit.prevent="sendMessage" class="w-100">
              <v-row>
                <v-col cols="12" class="d-flex align-center">
                  <v-text-field
                    v-model="newMessage"
                    placeholder="Type your message..."
                    :disabled="loading"
                    @keydown.enter.prevent="sendMessage"
                    hide-details
                    class="mr-2"
                    :loading="loading"
                  >
                    <template v-slot:append>
                      <v-btn
                        icon
                        color="primary"
                        :loading="loading"
                        :disabled="!newMessage.trim() || loading"
                        @click="sendMessage"
                      >
                        <v-icon>mdi-send</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-actions>
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
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAxios } from '@/composables/useAxios'

const { apiGet, apiPost, apiDelete, showError, errorMessage } = useAxios()
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const initialLoading = ref(true)
const chatContainer = ref(null)

// Format timestamp
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Scroll to bottom of chat
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    const container = chatContainer.value.$el
    container.scrollTop = container.scrollHeight
  }
}

// Watch messages for changes and scroll to bottom
watch(messages, () => {
  scrollToBottom()
})

// Load chat history on mount
onMounted(async () => {
  try {
    initialLoading.value = true
    const response = await apiGet('/chats')
    messages.value = response.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at
    }))
  } catch (error) {
    errorMessage.value = 'Failed to load chat history'
    showError.value = true
  } finally {
    initialLoading.value = false
  }
})

// Send message to AI
const sendMessage = async () => {
  if (!newMessage.value.trim() || loading.value) return

  const messageToSend = newMessage.value
  newMessage.value = ''
  loading.value = true

  try {
    const response = await apiPost('/chats/ask', {
      message: messageToSend
    })

    // Add both user message and AI response to the messages array
    messages.value.push({
      id: response.message.id,
      role: 'user',
      content: messageToSend,
      created_at: new Date()
    })

    messages.value.push({
      id: response.message.id + 1, // Assuming AI message ID follows user message
      role: 'ai',
      content: response.ai_response,
      created_at: new Date()
    })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to send message'
    showError.value = true
  } finally {
    loading.value = false
  }
}

// Clear chat history
const clearChat = async () => {
  if (!confirm('Are you sure you want to clear all messages?')) return
  
  try {
    loading.value = true
    await apiDelete('/chats')
    messages.value = []
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to clear chat history'
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.message-bubble {
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message {
  background-color: #e3f2fd;
  margin-left: auto;
}

.ai-message {
  background-color: #f5f5f5;
  margin-right: auto;
}

.v-card-text {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.message-skeleton {
  border-radius: 12px !important;
}

/* Custom scrollbar */
.v-card-text::-webkit-scrollbar {
  width: 8px;
}

.v-card-text::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.v-card-text::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .user-message {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }

  .ai-message {
    background-color: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .v-card-text::-webkit-scrollbar-track {
    background: rgb(var(--v-theme-surface));
  }

  .v-card-text::-webkit-scrollbar-thumb {
    background: rgb(var(--v-theme-surface-variant));
  }

  .v-card-text::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--v-theme-outline));
  }
}
</style> 