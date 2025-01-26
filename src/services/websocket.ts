import { ref } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, Task, Communication, Note } from '@/types/lead'

class WebSocketService {
  private socket: WebSocket | null = null
  private store = useLeadStore()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second delay
  private heartbeatInterval: number | null = null
  
  // Connection status
  public isConnected = ref(false)
  public lastMessage = ref<Date | null>(null)

  constructor() {
    this.initializeWebSocket()
  }

  private initializeWebSocket() {
    try {
      this.socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3001')
      
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
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
        this.reconnectAttempts++
        this.reconnectDelay *= 2 // Exponential backoff
        this.initializeWebSocket()
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
      if (this.isConnected.value) {
        this.send({ type: 'heartbeat' })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)
      this.lastMessage.value = new Date()

      switch (message.type) {
        case 'lead_update':
          this.handleLeadUpdate(message.data)
          break
        case 'task_update':
          this.handleTaskUpdate(message.data)
          break
        case 'communication_update':
          this.handleCommunicationUpdate(message.data)
          break
        case 'note_update':
          this.handleNoteUpdate(message.data)
          break
        case 'bulk_update':
          this.handleBulkUpdate(message.data)
          break
        case 'heartbeat':
          // Handle heartbeat response if needed
          break
        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  }

  private handleLeadUpdate(data: { action: string; lead: Lead }) {
    switch (data.action) {
      case 'create':
        this.store.addLead(data.lead)
        break
      case 'update':
        this.store.updateLead(data.lead.id, data.lead)
        break
      case 'delete':
        this.store.deleteLead(data.lead.id)
        break
    }
  }

  private handleTaskUpdate(data: { action: string; task: Task }) {
    switch (data.action) {
      case 'create':
        this.store.addTask(data.task)
        break
      case 'update':
        this.store.updateTask(data.task.id, data.task)
        break
      case 'delete':
        this.store.deleteTask(data.task.id)
        break
    }
  }

  private handleCommunicationUpdate(data: { action: string; communication: Communication }) {
    switch (data.action) {
      case 'create':
        this.store.addCommunication(data.communication)
        break
      case 'update':
        this.store.updateCommunication(data.communication.id, data.communication)
        break
      case 'delete':
        this.store.deleteCommunication(data.communication.id)
        break
    }
  }

  private handleNoteUpdate(data: { action: string; note: Note }) {
    switch (data.action) {
      case 'create':
        this.store.addNote(data.note)
        break
      case 'update':
        this.store.updateNote(data.note.id, data.note)
        break
      case 'delete':
        this.store.deleteNote(data.note.id)
        break
    }
  }

  private handleBulkUpdate(data: {
    leads?: Lead[];
    tasks?: Task[];
    communications?: Communication[];
    notes?: Note[];
  }) {
    if (data.leads) {
      this.store.$patch({ leads: data.leads })
    }
    if (data.tasks) {
      this.store.$patch({ tasks: data.tasks })
    }
    if (data.communications) {
      this.store.$patch({ communications: data.communications })
    }
    if (data.notes) {
      this.store.$patch({ notes: data.notes })
    }
  }

  public send(data: any) {
    if (this.socket && this.isConnected.value) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('Cannot send message: WebSocket is not connected')
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close()
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService()

// Export a composable to use the WebSocket service
export function useWebSocket() {
  return {
    isConnected: websocketService.isConnected,
    lastMessage: websocketService.lastMessage,
    send: (data: any) => websocketService.send(data),
    disconnect: () => websocketService.disconnect()
  }
}
