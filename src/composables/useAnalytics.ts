import { ref, computed } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, Communication } from '@/types/lead'
import { DateTime } from 'luxon'

export function useAnalytics() {
  const store = useLeadStore()

  const leadFunnel = computed(() => {
    const total = store.leads.length
    const newLeads = store.leads.filter(lead => lead.status === 'new').length
    const contacted = store.leads.filter(lead => lead.status === 'contacted').length
    const qualified = store.leads.filter(lead => lead.status === 'qualified').length
    const negotiating = store.leads.filter(lead => lead.status === 'negotiating').length
    const closed = store.leads.filter(lead => lead.status === 'closed').length
    const lost = store.leads.filter(lead => lead.status === 'lost').length

    return {
      'New Leads': {
        count: newLeads,
        percentage: (newLeads / total) * 100
      },
      'Contacted': {
        count: contacted,
        percentage: (contacted / total) * 100
      },
      'Qualified': {
        count: qualified,
        percentage: (qualified / total) * 100
      },
      'Negotiating': {
        count: negotiating,
        percentage: (negotiating / total) * 100
      },
      'Closed': {
        count: closed,
        percentage: (closed / total) * 100
      },
      'Lost': {
        count: lost,
        percentage: (lost / total) * 100
      }
    }
  })

  const leadsByStatus = computed(() => {
    const statusCounts: Record<string, number> = {}
    store.leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    })
    return statusCounts
  })

  const leadsByPriority = computed(() => {
    const priorityCounts: Record<string, number> = {
      'High': 0,
      'Medium': 0,
      'Low': 0
    }

    store.leads.forEach(lead => {
      if (lead.priority && lead.priority >= 8) {
        priorityCounts['High']++
      } else if (lead.priority && lead.priority >= 5) {
        priorityCounts['Medium']++
      } else {
        priorityCounts['Low']++
      }
    })

    return priorityCounts
  })

  const taskStats = computed(() => {
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })

    const recentTasks = store.tasks.filter(task => {
      const taskDate = DateTime.fromISO(task.scheduledDate)
      return taskDate >= thirtyDaysAgo && taskDate <= now
    })

    return {
      completed: recentTasks.filter(task => task.completed).length,
      inProgress: recentTasks.filter(task => !task.completed).length,
      recentTasks
    }
  })

  const communicationStats = computed(() => {
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })

    const recentCommunications = store.communications.filter(comm => {
      const commDate = DateTime.fromISO(comm.timestamp)
      return commDate >= thirtyDaysAgo && commDate <= now
    })

    const byType = {
      outbound: recentCommunications.filter(comm => comm.type === 'outbound').length,
      inbound: recentCommunications.filter(comm => comm.type === 'inbound').length
    }

    const byMethod = recentCommunications.reduce((acc: Record<string, number>, comm) => {
      acc[comm.method] = (acc[comm.method] || 0) + 1
      return acc
    }, {})

    return {
      byType,
      byMethod,
      recentCommunications
    }
  })

  const revenueStats = computed(() => {
    const now = DateTime.now()
    const sixMonthsAgo = now.minus({ months: 6 })
    const months: string[] = []
    const values: number[] = []

    let current = sixMonthsAgo.startOf('month')
    while (current <= now) {
      const monthStr = current.toFormat('MMM yyyy')
      months.push(monthStr)

      const monthRevenue = store.leads
        .filter(lead => {
          if (!lead.quotationValue || lead.status !== 'closed') return false
          const leadDate = DateTime.fromISO(lead.updatedAt)
          return leadDate.hasSame(current, 'month')
        })
        .reduce((sum, lead) => sum + (lead.quotationValue || 0), 0)

      values.push(monthRevenue)
      current = current.plus({ months: 1 })
    }

    return { months, values }
  })

  const refreshAnalytics = () => {
    // Refresh store data if needed
    store.fetchLeads()
    store.fetchTasks()
    store.fetchCommunications()
  }

  return {
    leadFunnel,
    leadsByStatus,
    leadsByPriority,
    taskStats,
    communicationStats,
    revenueStats,
    refreshAnalytics
  }
}
