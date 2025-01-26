import { ref } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, Task, Communication, Note } from '@/types/lead'

class WebSocketService {
  private socket: WebSocket | null = null
  private store = useLeadStore()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  
  public isConnected = ref(false)
  public lastMessage = ref<Date | null>(null)

  constructor() {
    this.initializeWebSocket()
  }

  private initializeWebSocket() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 
        (window.location.protocol === 'https:' ? 
          'wss://localhost:3000/ws' : 
          'ws://localhost:3000/ws')

      this.socket = new WebSocket(wsUrl)
      
      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected.value = true
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
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
        this.handleMessage(event.data)
        this.lastMessage.value = new Date()
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log('Attempting to reconnect... (' + this.reconnectAttempts + '/' + this.maxReconnectAttempts + ')')
      setTimeout(() => {
        this.initializeWebSocket()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.log('Max reconnection attempts reached')
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'heartbeat' }))
      }
    }, 30000)
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)
      switch (message.type) {
        case 'connection':
          console.log('Connection status:', message.status)
          break
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  }

  public send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }
}

const websocketService = new WebSocketService()

export function useWebSocket() {
  return {
    isConnected: websocketService.isConnected,
    lastMessage: websocketService.lastMessage,
    send: (data: any) => websocketService.send(data)
  }
}
