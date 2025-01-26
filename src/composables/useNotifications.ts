import { ref, computed } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import { useToast } from 'primevue/usetoast'
import { DateTime } from 'luxon'
import type { Lead, Task, Communication, Note } from '@/types/lead'
import { useNotificationStore } from '@/stores/notificationStore'
import { storeToRefs } from 'pinia'
import type { Notification, NotificationPreferences } from '@/types/notification'

interface Notification {
  id: string
  type: 'lead' | 'task' | 'communication' | 'note'
  action: 'create' | 'update' | 'delete'
  title: string
  message: string
  timestamp: Date
  read: boolean
  severity: 'success' | 'info' | 'warn' | 'error'
  data?: any
}

const notifications = ref<Notification[]>([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

export function useNotifications() {
  const store = useNotificationStore()
  const { notifications: notificationStore, preferences, loading, error, unreadCount: unreadCountStore, groupedNotifications, recentNotifications } = storeToRefs(store)

  const initialize = async () => {
    await store.fetchNotifications()
  }

  const markAsRead = async (id: string) => {
    await store.markAsRead(id)
  }

  const markAllAsRead = async () => {
    await store.markAllAsRead()
  }

  const deleteNotification = async (id: string) => {
    await store.deleteNotification(id)
  }

  const clearAllNotifications = async () => {
    await store.clearAllNotifications()
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    await store.updatePreferences(newPreferences)
  }

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    return await store.addNotification(notification)
  }

  const handleLeadUpdate = (action: 'create' | 'update' | 'delete', lead: Lead) => {
    const messages = {
      create: `New lead created: ${lead.name}`,
      update: `Lead updated: ${lead.name}`,
      delete: `Lead deleted: ${lead.name}`
    }

    const severities = {
      create: 'success' as const,
      update: 'info' as const,
      delete: 'warn' as const
    }

    addNotification({
      type: 'lead',
      action,
      title: 'Lead Update',
      message: messages[action],
      severity: severities[action],
      data: lead
    })
  }

  const handleTaskUpdate = (action: 'create' | 'update' | 'delete', task: Task) => {
    const lead = useLeadStore().getLeadById.value(task.leadId)
    const leadName = lead ? lead.name : 'Unknown Lead'

    const messages = {
      create: `New task created for ${leadName}: ${task.title}`,
      update: `Task updated for ${leadName}: ${task.title}`,
      delete: `Task deleted for ${leadName}: ${task.title}`
    }

    const severities = {
      create: 'success' as const,
      update: 'info' as const,
      delete: 'warn' as const
    }

    addNotification({
      type: 'task',
      action,
      title: 'Task Update',
      message: messages[action],
      severity: severities[action],
      data: task
    })
  }

  const handleCommunicationUpdate = (
    action: 'create' | 'update' | 'delete',
    communication: Communication
  ) => {
    const lead = useLeadStore().getLeadById.value(communication.leadId)
    const leadName = lead ? lead.name : 'Unknown Lead'

    const messages = {
      create: `New ${communication.type} communication with ${leadName}`,
      update: `Communication updated with ${leadName}`,
      delete: `Communication deleted with ${leadName}`
    }

    const severities = {
      create: 'success' as const,
      update: 'info' as const,
      delete: 'warn' as const
    }

    addNotification({
      type: 'communication',
      action,
      title: 'Communication Update',
      message: messages[action],
      severity: severities[action],
      data: communication
    })
  }

  const handleNoteUpdate = (action: 'create' | 'update' | 'delete', note: Note) => {
    const lead = useLeadStore().getLeadById.value(note.leadId)
    const leadName = lead ? lead.name : 'Unknown Lead'

    const messages = {
      create: `New note added for ${leadName}`,
      update: `Note updated for ${leadName}`,
      delete: `Note deleted for ${leadName}`
    }

    const severities = {
      create: 'success' as const,
      update: 'info' as const,
      delete: 'warn' as const
    }

    addNotification({
      type: 'note',
      action,
      title: 'Note Update',
      message: messages[action],
      severity: severities[action],
      data: note
    })
  }

  return {
    // State
    notifications: notificationStore,
    preferences,
    loading,
    error,
    unreadCount: unreadCountStore,
    groupedNotifications,
    recentNotifications,

    // Methods
    initialize,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    addNotification,
    handleLeadUpdate,
    handleTaskUpdate,
    handleCommunicationUpdate,
    handleNoteUpdate
  }
}
