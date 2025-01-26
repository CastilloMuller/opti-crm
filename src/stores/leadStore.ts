import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Lead, Task, Communication, Note, LeadFilter, LeadSort } from '@/types/lead'
import { DateTime } from 'luxon'

export const useLeadStore = defineStore('leads', () => {
  // State
  const leads = ref<Lead[]>([])
  const tasks = ref<Task[]>([])
  const communications = ref<Communication[]>([])
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getLeadById = computed(() => (id: string) => {
    return leads.value.find(lead => lead.id === id)
  })

  const getTasksByLeadId = computed(() => (leadId: string) => {
    return tasks.value.filter(task => task.leadId === leadId)
  })

  const getCommunicationsByLeadId = computed(() => (leadId: string) => {
    return communications.value.filter(comm => comm.leadId === leadId)
  })

  const getNotesByLeadId = computed(() => (leadId: string) => {
    return notes.value.filter(note => note.leadId === leadId)
  })

  const getFilteredLeads = computed(() => (filter: LeadFilter) => {
    return leads.value.filter(lead => {
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(lead.status)) return false
      }
      
      if (filter.priority && filter.priority.length > 0) {
        if (!filter.priority.includes(lead.priority)) return false
      }

      if (filter.source && filter.source.length > 0) {
        if (!filter.source.includes(lead.source)) return false
      }

      if (filter.assignedTo && filter.assignedTo.length > 0) {
        if (!filter.assignedTo.includes(lead.assignedTo)) return false
      }

      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => lead.tags.includes(tag))) return false
      }

      if (filter.dateRange) {
        const leadDate = DateTime.fromISO(lead.createdAt)
        const startDate = DateTime.fromISO(filter.dateRange.start)
        const endDate = DateTime.fromISO(filter.dateRange.end)
        if (leadDate < startDate || leadDate > endDate) return false
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        return (
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  })

  const getSortedLeads = computed(() => (leads: Lead[], sort: LeadSort) => {
    return [...leads].sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0
      }
    })
  })

  // Actions
  const fetchLeads = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/leads')
      leads.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leads'
      console.error('Error fetching leads:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchTasks = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/tasks')
      tasks.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchCommunications = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/communications')
      communications.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch communications'
      console.error('Error fetching communications:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchNotes = async () => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/notes')
      notes.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch notes'
      console.error('Error fetching notes:', e)
    } finally {
      loading.value = false
    }
  }

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lead)
      })
      const newLead = await response.json()
      leads.value.push(newLead)
      return newLead
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add lead'
      console.error('Error adding lead:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      const updatedLead = await response.json()
      const index = leads.value.findIndex(lead => lead.id === id)
      if (index !== -1) {
        leads.value[index] = updatedLead
      }
      return updatedLead
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update lead'
      console.error('Error updating lead:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteLead = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch(`/api/leads/${id}`, {
        method: 'DELETE'
      })
      leads.value = leads.value.filter(lead => lead.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete lead'
      console.error('Error deleting lead:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      })
      const newTask = await response.json()
      tasks.value.push(newTask)
      return newTask
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add task'
      console.error('Error adding task:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      const updatedTask = await response.json()
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update task'
      console.error('Error updating task:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Replace with actual API call
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      tasks.value = tasks.value.filter(task => task.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete task'
      console.error('Error deleting task:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    leads,
    tasks,
    communications,
    notes,
    loading,
    error,

    // Getters
    getLeadById,
    getTasksByLeadId,
    getCommunicationsByLeadId,
    getNotesByLeadId,
    getFilteredLeads,
    getSortedLeads,

    // Actions
    fetchLeads,
    fetchTasks,
    fetchCommunications,
    fetchNotes,
    addLead,
    updateLead,
    deleteLead,
    addTask,
    updateTask,
    deleteTask
  }
})
