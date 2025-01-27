import { ref } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, Task, Communication, Note } from '@/types/lead'

class WebSocketService {
  private socket: WebSocket | null = null
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
          'wss://opti-crm-api.onrender.com/ws' : 
          'ws://localhost:3000/ws')

      console.log('Connecting to WebSocket:', wsUrl)
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
      console.error('Error initializing WebSocket:', error)
      this.handleReconnect()
    }
  }

  private handleMessage(data: string) {
    try {
      const store = useLeadStore()
      const message = JSON.parse(data)
      
      switch (message.type) {
        case 'lead':
          store.updateLead(message.data as Lead)
          break
        case 'task':
          store.updateTask(message.data as Task)
          break
        case 'communication':
          store.updateCommunication(message.data as Communication)
          break
        case 'note':
          store.updateNote(message.data as Note)
          break
        case 'pong':
          // Handle heartbeat response
          break
        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.initializeWebSocket()
        this.reconnectDelay *= 2 // Exponential backoff
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
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

  public sendMessage(type: string, data: any) {
    if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }))
    } else {
      console.warn('WebSocket is not connected')
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
