import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, NotificationType, NotificationPreferences } from '@/types/notification'
import { DateTime } from 'luxon'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const preferences = ref<NotificationPreferences>({
    userId: '',
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: true,
    notificationTypes: {
      task_due: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      task_completed: {
        enabled: true,
        email: false,
        push: true,
        desktop: true
      },
      lead_created: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      lead_updated: {
        enabled: true,
        email: false,
        push: true,
        desktop: true
      },
      lead_status_changed: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      communication_received: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      communication_scheduled: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      note_added: {
        enabled: true,
        email: false,
        push: true,
        desktop: true
      },
      mention: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      },
      system: {
        enabled: true,
        email: true,
        push: true,
        desktop: true
      }
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const groupedNotifications = computed(() => {
    const groups: { [key: string]: Notification[] } = {}
    
    notifications.value.forEach(notification => {
      const date = DateTime.fromISO(notification.timestamp).toFormat('yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
    })

    return Object.entries(groups).map(([date, notifications]) => ({
      date,
      notifications: notifications.sort((a, b) => 
        DateTime.fromISO(b.timestamp).toMillis() - DateTime.fromISO(a.timestamp).toMillis()
      )
    }))
  })

  const recentNotifications = computed(() => {
    return [...notifications.value]
      .sort((a, b) => DateTime.fromISO(b.timestamp).toMillis() - DateTime.fromISO(a.timestamp).toMillis())
      .slice(0, 5)
  })

  // Actions
  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/notifications')
      notifications.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch notifications'
      console.error('Error fetching notifications:', e)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index] = {
          ...notifications.value[index],
          read: true
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to mark notification as read'
      console.error('Error marking notification as read:', e)
    } finally {
      loading.value = false
    }
  }

  const markAllAsRead = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch('/api/notifications/read-all', {
        method: 'POST'
      })
      notifications.value = notifications.value.map(n => ({
        ...n,
        read: true
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to mark all notifications as read'
      console.error('Error marking all notifications as read:', e)
    } finally {
      loading.value = false
    }
  }

  const deleteNotification = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      notifications.value = notifications.value.filter(n => n.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete notification'
      console.error('Error deleting notification:', e)
    } finally {
      loading.value = false
    }
  }

  const clearAllNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch('/api/notifications/clear-all', {
        method: 'POST'
      })
      notifications.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear all notifications'
      console.error('Error clearing all notifications:', e)
    } finally {
      loading.value = false
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/notification-preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      })
      const updatedPreferences = await response.json()
      preferences.value = updatedPreferences
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update notification preferences'
      console.error('Error updating notification preferences:', e)
    } finally {
      loading.value = false
    }
  }

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      })
      const newNotification = await response.json()
      notifications.value.unshift(newNotification)
      return newNotification
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add notification'
      console.error('Error adding notification:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    notifications,
    preferences,
    loading,
    error,

    // Getters
    unreadCount,
    groupedNotifications,
    recentNotifications,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    addNotification
  }
})
