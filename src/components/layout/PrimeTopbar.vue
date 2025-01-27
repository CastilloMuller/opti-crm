<template>
  <header class="topbar">
    <div class="flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <span class="text-xl">{{ pageTitle }}</span>
      </div>
      <div class="flex align-items-center gap-3">
        <Button v-tooltip.bottom="isConnected ? 'Connected' : 'Disconnected'"
          :icon="isConnected ? 'pi pi-wifi' : 'pi pi-wifi-off'"
          :severity="isConnected ? 'success' : 'danger'"
          text rounded />
        
        <Button v-badge="unreadNotifications" 
          icon="pi pi-bell" 
          @click="toggleNotifications"
          text rounded />
        
        <Avatar icon="pi pi-user" shape="circle" />
      </div>
    </div>
    
    <Dialog v-model:visible="showNotifications" 
      header="Notifications" 
      :modal="false"
      position="right"
      :breakpoints="{'960px': '75vw', '640px': '100vw'}" 
      :style="{width: '35vw'}">
      <div class="notifications-container">
        <div v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item p-3 border-bottom-1 surface-border">
          <div class="flex align-items-center gap-2">
            <i :class="notification.icon" class="text-primary"></i>
            <span class="font-semibold">{{ notification.title }}</span>
          </div>
          <p class="text-sm text-color-secondary mt-2 mb-0">{{ notification.message }}</p>
          <small class="text-color-secondary">{{ formatDate(notification.timestamp) }}</small>
        </div>
      </div>
    </Dialog>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useWebSocket } from '@/services/websocket'

const route = useRoute()
const { isConnected } = useWebSocket()

const showNotifications = ref(false)
const notifications = ref([
  {
    id: 1,
    title: 'New Lead',
    message: 'John Doe has been added as a new lead',
    icon: 'pi pi-user-plus',
    timestamp: new Date()
  },
  {
    id: 2,
    title: 'Task Due',
    message: 'Follow-up call with Sarah Smith is due in 1 hour',
    icon: 'pi pi-clock',
    timestamp: new Date()
  }
])

const unreadNotifications = computed(() => notifications.value.length)

const pageTitle = computed(() => {
  const routeName = route.name as string || 'Dashboard'
  return routeName.charAt(0).toUpperCase() + routeName.slice(1)
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}
</script>

<style scoped>
.topbar {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1rem;
}

.notifications-container {
  max-height: 70vh;
  overflow-y: auto;
}

.notification-item {
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--surface-hover);
}
</style>
