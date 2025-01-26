export type NotificationType = 
  | 'task_due'
  | 'task_completed'
  | 'lead_created'
  | 'lead_updated'
  | 'lead_status_changed'
  | 'communication_received'
  | 'communication_scheduled'
  | 'note_added'
  | 'mention'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  timestamp: string
  read: boolean
  actionRequired: boolean
  actionUrl?: string
  metadata?: {
    leadId?: string
    taskId?: string
    communicationId?: string
    noteId?: string
    userId?: string
    [key: string]: any
  }
}

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  notificationTypes: {
    [K in NotificationType]: {
      enabled: boolean
      email: boolean
      push: boolean
      desktop: boolean
    }
  }
  quietHours: {
    enabled: boolean
    start: string // 24-hour format HH:mm
    end: string // 24-hour format HH:mm
    timezone: string
  }
}

export interface NotificationGroup {
  date: string
  notifications: Notification[]
}
