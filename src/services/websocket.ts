import { ref } from 'vue'
import { useStore } from '@/stores/store'

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 1000
  private store: ReturnType<typeof useStore>
  
  public isConnected = ref(false)
  public lastMessage = ref<Date | null>(null)

  constructor() {
    this.store = useStore()
    this.initializeWebSocket()
  }

  private initializeWebSocket() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 
        (window.location.protocol === 'https:' ? 
          'wss://opti-crm-api.onrender.com/ws' : 
          'ws://localhost:3000/ws')

      console.log('Connecting to WebSocket:', wsUrl)
      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected.value = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.socket.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected.value = false
        this.handleReconnect()
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected.value = false
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
          this.lastMessage.value = new Date()
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.initializeWebSocket()
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
      this.store.addNotification({
        severity: 'error',
        summary: 'Connection Error',
        detail: 'Unable to connect to the server. Please try again later.',
        life: 5000
      })
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'notification':
        this.store.addNotification(data.payload)
        break
      case 'lead_update':
        this.store.updateLead(data.payload)
        break
      case 'pong':
        // Handle heartbeat response
        break
      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  public sendMessage(message: any) {
    if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

const websocketService = new WebSocketService()

export function useWebSocket() {
  return {
    isConnected: websocketService.isConnected,
    lastMessage: websocketService.lastMessage,
    sendMessage: websocketService.sendMessage.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService)
  }
}

export default websocketService
