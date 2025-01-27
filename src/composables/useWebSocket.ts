import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from './useNotifications'
import type { Notification } from '@/types/notification'

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000 // 1 second
  const { addNotification } = useNotifications()

  const connect = () => {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 
        (window.location.protocol === 'https:' ? 
          'wss://opti-crm-api.onrender.com/ws' : 
          'ws://localhost:3000/ws')

      console.log('Connecting to WebSocket:', wsUrl)
      socket.value = new WebSocket(wsUrl)

      socket.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        reconnectAttempts.value = 0
      }

      socket.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        handleReconnect()
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        isConnected.value = false
      }

      socket.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      handleReconnect()
    }
  }

  const handleReconnect = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`)
      
      setTimeout(() => {
        connect()
      }, reconnectDelay)
    } else {
      console.log('Max reconnection attempts reached')
      addNotification({
        severity: 'error',
        summary: 'Connection Error',
        detail: 'Unable to connect to the server. Please try again later.',
        life: 5000
      })
    }
  }

  const handleWebSocketMessage = (data: any) => {
    // Handle different message types
    switch (data.type) {
      case 'notification':
        addNotification(data.payload)
        break
      case 'lead_update':
        handleLeadUpdate(data.payload)
        break
      case 'task_update':
        handleTaskUpdate(data.payload)
        break
      case 'communication_update':
        handleCommunicationUpdate(data.payload)
        break
      case 'system_message':
        handleSystemMessage(data.payload)
        break
      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  const handleNotification = (payload: Notification) => {
    addNotification(payload)
  }

  const handleLeadUpdate = (payload: any) => {
    addNotification({
      type: 'lead_updated',
      title: 'Lead Updated',
      message: `Lead "${payload.name}" has been updated`,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        leadId: payload.id
      }
    })
  }

  const handleTaskUpdate = (payload: any) => {
    addNotification({
      type: 'task_updated',
      title: 'Task Updated',
      message: `Task "${payload.title}" has been updated`,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        taskId: payload.id,
        leadId: payload.leadId
      }
    })
  }

  const handleCommunicationUpdate = (payload: any) => {
    addNotification({
      type: 'communication_received',
      title: 'New Communication',
      message: `New ${payload.method} communication for lead "${payload.leadName}"`,
      priority: 'medium',
      actionRequired: true,
      metadata: {
        communicationId: payload.id,
        leadId: payload.leadId
      }
    })
  }

  const handleSystemMessage = (payload: any) => {
    addNotification({
      type: 'system',
      title: payload.title || 'System Message',
      message: payload.message,
      priority: payload.priority || 'medium',
      actionRequired: payload.actionRequired || false,
      metadata: payload.metadata
    })
  }

  const sendMessage = (type: string, payload: any) => {
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify({ type, payload }))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    if (socket.value) {
      socket.value.close()
    }
  })

  return {
    isConnected,
    socket,
    sendMessage,
    connect,
    disconnect
  }
}
