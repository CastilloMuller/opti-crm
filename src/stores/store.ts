import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
  const isConnected = ref(false)
  const notifications = ref<any[]>([])
  const leads = ref<any[]>([])

  function setConnectionStatus(status: boolean) {
    isConnected.value = status
  }

  function addNotification(notification: any) {
    notifications.value.push(notification)
  }

  function updateLead(lead: any) {
    const index = leads.value.findIndex(l => l.id === lead.id)
    if (index !== -1) {
      leads.value[index] = lead
    } else {
      leads.value.push(lead)
    }
  }

  return {
    isConnected,
    notifications,
    leads,
    setConnectionStatus,
    addNotification,
    updateLead
  }
})
