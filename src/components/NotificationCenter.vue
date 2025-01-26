<template>
  <div class="notification-center">
    <Button
      type="button"
      class="notification-button p-button-text"
      @click="togglePanel"
      aria-haspopup="true"
      aria-controls="notification_menu"
      v-badge="unreadCount"
    >
      <i class="pi pi-bell"></i>
    </Button>

    <OverlayPanel ref="notificationPanel" :showCloseIcon="true">
      <div class="notification-list">
        <div v-if="sortedNotifications.length === 0" class="no-notifications">
          No notifications
        </div>
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <i :class="getNotificationIcon(notification)" />
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatDate(notification.timestamp) }}</div>
          </div>
          <Badge
            v-if="!notification.read"
            :severity="getNotificationSeverity(notification)"
            value="New"
          />
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { useLeadStore } from '@/stores/leadStore'
import { formatDate } from '@/utils/dateUtils'
import type { Notification } from '@/types/notification'
import OverlayPanel from 'primevue/overlaypanel'
import Button from 'primevue/button'
import Badge from 'primevue/badge'

const store = useLeadStore()
const { notifications, markAsRead } = useNotifications()

const notificationPanel = ref()

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const sortedNotifications = computed(() => {
  return [...notifications.value].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

const getNotificationIcon = (notification: Notification) => {
  const icons = {
    lead: 'pi pi-user',
    task: 'pi pi-calendar',
    communication: 'pi pi-comments',
    note: 'pi pi-file'
  }
  return icons[notification.type] || 'pi pi-info-circle'
}

const getNotificationSeverity = (notification: Notification) => {
  switch (notification.type) {
    case 'lead':
      return 'info'
    case 'task':
      return 'warning'
    case 'communication':
      return 'success'
    case 'note':
      return 'info'
    default:
      return 'info'
  }
}

const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification.id)
  notificationPanel.value.hide()
}

const togglePanel = (event: Event) => {
  notificationPanel.value.toggle(event)
}
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-list {
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 1rem;
  text-align: center;
  color: var(--text-color-secondary);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--surface-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--surface-hover);
}

.notification-item.unread {
  background-color: var(--surface-ground);
}

.notification-item i {
  margin-right: 0.75rem;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.notification-time {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}
</style>
