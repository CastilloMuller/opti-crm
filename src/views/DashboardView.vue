<template>
  <div class="grid">
    <!-- Stats Cards -->
    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Total Leads</span>
            <div class="text-900 font-medium text-xl">{{ leadMetrics.total }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-users text-blue-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">{{ leadMetrics.new }} new </span>
        <span class="text-500">since last week</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Open Tasks</span>
            <div class="text-900 font-medium text-xl">{{ todaysTasks.total }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-check-square text-orange-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500">{{ todaysTasks.completed }} completed this week</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Conversion Rate</span>
            <div class="text-900 font-medium text-xl">{{ conversionMetrics.conversionRate }}%</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-percentage text-cyan-500 text-xl"></i>
          </div>
        </div>
        <span class="text-{{ conversionMetrics.conversionTrend > 0 ? 'green' : 'red' }}-500 font-medium">{{ Math.abs(conversionMetrics.conversionTrend) }}% </span>
        <span class="text-500">vs last month</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Revenue</span>
            <div class="text-900 font-medium text-xl">€{{ formatCurrency(performanceMetrics.revenue) }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-euro text-purple-500 text-xl"></i>
          </div>
        </div>
        <span class="text-{{ performanceMetrics.revenueTrend > 0 ? 'green' : 'red' }}-500 font-medium">{{ performanceMetrics.revenueTrend }}% </span>
        <span class="text-500">vs last month</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="col-12 lg:col-6">
      <div class="surface-card p-4 border-round shadow-1">
        <h3>Lead Status Distribution</h3>
        <Chart type="pie" :data="leadStatusData" :options="chartOptions" />
      </div>
    </div>

    <div class="col-12 lg:col-6">
      <div class="surface-card p-4 border-round shadow-1">
        <h3>Revenue Trend</h3>
        <Chart type="line" :data="revenueTrendData" :options="chartOptions" />
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="col-12 lg:col-6">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between align-items-center mb-4">
          <h3>Recent Activities</h3>
          <Button label="View All" link />
        </div>
        <Timeline :value="recentActivities" class="customized-timeline">
          <template #content="slotProps">
            <div class="flex flex-column">
              <small class="text-color-secondary mb-1">{{ formatDateTime(slotProps.item.timestamp) }}</small>
              <span class="font-medium mb-1">{{ slotProps.item.title }}</span>
              <p class="text-color-secondary m-0">{{ slotProps.item.description }}</p>
            </div>
          </template>
        </Timeline>
      </div>
    </div>

    <!-- Upcoming Tasks -->
    <div class="col-12 lg:col-6">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between align-items-center mb-4">
          <h3>Upcoming Tasks</h3>
          <Button label="View All" link />
        </div>
        <DataTable :value="upcomingTasks" :rows="5" :paginator="false" class="p-datatable-sm">
          <Column field="title" header="Task"></Column>
          <Column field="scheduledDate" header="Due Date">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.scheduledDate) }}
            </template>
          </Column>
          <Column field="priority" header="Priority">
            <template #body="slotProps">
              <Tag :value="slotProps.data.priority" :severity="getPrioritySeverity(slotProps.data.priority)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import { useLeadStore } from '@/stores/leadStore'
import { useWebSocket } from '@/services/websocket'
import { DateTime } from 'luxon'

// PrimeVue Components
import Chart from 'primevue/chart'
import Timeline from 'primevue/timeline'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

const router = useRouter()
const store = useLeadStore()
const {
  leadMetrics = ref({
    total: 0,
    new: 0,
    statusCounts: {}
  }),
  leadFunnel = ref({
    stages: []
  }),
  activityMetrics = ref({
    total: 0,
    completed: 0
  }),
  performanceMetrics = ref({
    revenue: 0,
    revenueTrend: 0,
    monthly: []
  }),
  conversionMetrics = ref({
    conversionRate: 0,
    conversionTrend: 0
  })
} = useAnalytics()

const { isConnected, lastMessage } = useWebSocket()

// Real-time status
const connectionStatus = computed(() => ({
  status: isConnected.value ? 'Connected' : 'Disconnected',
  class: isConnected.value ? 'status-connected' : 'status-disconnected',
  icon: isConnected.value ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'
}))

const lastUpdate = computed(() => 
  lastMessage.value ? DateTime.fromJSDate(lastMessage.value).toRelative() : 'Never'
)

// Lead Status Chart
const leadStatusData = computed(() => ({
  labels: Object.keys(leadMetrics.value.statusCounts),
  datasets: [{
    data: Object.values(leadMetrics.value.statusCounts),
    backgroundColor: [
      '#3e5b82',
      '#4a6b92',
      '#567ba2',
      '#628bb2',
      '#6e9bc2',
      '#7aabd2',
      '#86bbe2'
    ]
  }]
}))

// Performance Chart
const revenueTrendData = computed(() => ({
  labels: performanceMetrics.value.monthly.map(m => m.month),
  datasets: [
    {
      label: 'Revenue',
      data: performanceMetrics.value.monthly.map(m => m.revenue),
      borderColor: '#4BC0C0',
      tension: 0.4
    }
  ]
}))

// Chart Options
const chartOptions = {
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

// Tasks Overview
const todaysTasks = computed(() => {
  const today = DateTime.now().startOf('day')
  const tasks = store.tasks.filter(task => {
    const taskDate = DateTime.fromISO(task.scheduledDate)
    return taskDate >= today && taskDate < today.plus({ days: 1 })
  })
  
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length
  }
})

const upcomingTasks = computed(() => {
  const now = DateTime.now()
  return store.tasks
    .filter(task => !task.completed && DateTime.fromISO(task.scheduledDate) >= now)
    .sort((a, b) => 
      DateTime.fromISO(a.scheduledDate).toMillis() - 
      DateTime.fromISO(b.scheduledDate).toMillis()
    )
    .slice(0, 5)
})

// Recent Activities
const recentActivities = computed(() => {
  const activities: any[] = []

  // Add tasks
  store.tasks.forEach(task => {
    if (task.completed) {
      activities.push({
        type: 'task',
        icon: 'pi pi-check-circle',
        title: `Completed task: ${task.title}`,
        description: task.description,
        timestamp: task.scheduledDate
      })
    }
  })

  // Add communications
  store.communications.forEach(comm => {
    activities.push({
      type: 'communication',
      icon: comm.type === 'inbound' ? 'pi pi-arrow-down' : 'pi pi-arrow-up',
      title: `${comm.type === 'inbound' ? 'Received' : 'Sent'} ${comm.method}: ${comm.content.substring(0, 50)}...`,
      description: comm.content,
      timestamp: comm.timestamp
    })
  })

  return activities
    .sort((a, b) => 
      DateTime.fromISO(b.timestamp).toMillis() - 
      DateTime.fromISO(a.timestamp).toMillis()
    )
    .slice(0, 10)
})

// Utility Functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDateTime = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd MMM HH:mm')
}

const getPrioritySeverity = (priority: string) => {
  const map: { [key: string]: string } = {
    'High': 'danger',
    'Medium': 'warning',
    'Low': 'success'
  }
  return map[priority]
}
</script>

<style scoped>
:deep(.customized-timeline) {
  .p-timeline-event-content {
    line-height: 1.5;
  }
  
  .p-timeline-event-opposite {
    flex: 0;
    padding: 0 1rem;
  }
}

h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}
</style>
