import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from './useNotifications'

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://opti-crm-backend.onrender.com/ws'

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000 // 1 second
  const { addNotification } = useNotifications()

  const connect = () => {
    try {
      console.log('Connecting to WebSocket:', WS_URL)
      socket.value = new WebSocket(WS_URL)

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
      default:
        console.warn('Unknown message type:', data.type)
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
    socket
  }
}
