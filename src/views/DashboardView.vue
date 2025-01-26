<template>
  <div class="dashboard-view">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="header-actions">
        <Button 
          label="Refresh" 
          icon="pi pi-refresh" 
          @click="refreshData"
          class="p-button-outlined"
        />
      </div>
      <div class="connection-status">
        <i :class="connectionStatus.icon"></i>
        <span :class="connectionStatus.class">{{ connectionStatus.status }}</span>
        <small>Last update: {{ lastUpdate }}</small>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <Button 
        label="New Lead" 
        icon="pi pi-plus"
        @click="$router.push('/leads?new=true')"
        class="p-button-success"
      />
      <Button 
        label="Add Task" 
        icon="pi pi-calendar-plus"
        @click="$router.push('/calendar?new=true')"
      />
      <Button 
        label="View Analytics" 
        icon="pi pi-chart-line"
        @click="$router.push('/analytics')"
        class="p-button-help"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Lead Overview Card -->
      <Panel header="Lead Overview" class="dashboard-panel">
        <template #icons>
          <Button 
            icon="pi pi-arrow-right" 
            @click="$router.push('/leads')"
            class="p-button-text p-button-sm" 
          />
        </template>
        <div class="lead-stats">
          <div class="stat-item">
            <div class="stat-value">{{ leadMetrics.total }}</div>
            <div class="stat-label">Total Leads</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatCurrency(leadMetrics.totalValue) }}</div>
            <div class="stat-label">Total Value</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatPercent(conversionMetrics.conversionRate) }}</div>
            <div class="stat-label">Conversion Rate</div>
          </div>
        </div>
        <Chart type="doughnut" :data="leadStatusData" :options="doughnutOptions" class="mt-3" />
      </Panel>

      <!-- Recent Activity -->
      <Panel header="Recent Activity" class="dashboard-panel">
        <Timeline :value="recentActivity" class="activity-timeline">
          <template #content="slotProps">
            <div class="activity-item">
              <i :class="slotProps.item.icon"></i>
              <div class="activity-content">
                <div class="activity-text">{{ slotProps.item.description }}</div>
                <small>{{ formatTimeAgo(slotProps.item.timestamp) }}</small>
              </div>
            </div>
          </template>
        </Timeline>
      </Panel>

      <!-- Tasks Overview -->
      <Panel header="Tasks Overview" class="dashboard-panel">
        <template #icons>
          <Button 
            icon="pi pi-arrow-right" 
            @click="$router.push('/calendar')"
            class="p-button-text p-button-sm" 
          />
        </template>
        <div class="tasks-progress">
          <div class="progress-item">
            <label>Today's Tasks</label>
            <ProgressBar 
              :value="(todaysTasks.completed / todaysTasks.total) * 100" 
              :showValue="false"
            />
            <small>{{ todaysTasks.completed }}/{{ todaysTasks.total }} completed</small>
          </div>
          <div class="progress-item">
            <label>This Week</label>
            <ProgressBar 
              :value="(weekTasks.completed / weekTasks.total) * 100"
              :showValue="false"
            />
            <small>{{ weekTasks.completed }}/{{ weekTasks.total }} completed</small>
          </div>
        </div>
        <DataTable :value="upcomingTasks" class="mt-3">
          <Column field="title" header="Task">
            <template #body="{ data }">
              <div class="task-title">
                <Tag :value="data.type" />
                {{ data.title }}
              </div>
            </template>
          </Column>
          <Column field="scheduledDate" header="Due">
            <template #body="{ data }">
              {{ formatDateTime(data.scheduledDate) }}
            </template>
          </Column>
          <Column field="completed" header="Status">
            <template #body="{ data }">
              <Tag 
                :value="data.completed ? 'Completed' : 'Pending'"
                :severity="data.completed ? 'success' : 'warning'"
              />
            </template>
          </Column>
        </DataTable>
      </Panel>

      <!-- Hot Leads -->
      <Panel header="Hot Leads" class="dashboard-panel">
        <template #icons>
          <Button 
            icon="pi pi-arrow-right" 
            @click="$router.push('/leads?filter=hot')"
            class="p-button-text p-button-sm" 
          />
        </template>
        <DataTable :value="hotLeads" class="hot-leads-table">
          <Column field="name" header="Name" />
          <Column field="quotationValue" header="Value">
            <template #body="{ data }">
              {{ formatCurrency(data.quotationValue) }}
            </template>
          </Column>
          <Column field="decisionDate" header="Decision">
            <template #body="{ data }">
              {{ formatDate(data.decisionDate) }}
            </template>
          </Column>
          <Column field="leadscore" header="Score">
            <template #body="{ data }">
              <ProgressBar :value="data.leadscore" :showValue="true" />
            </template>
          </Column>
        </DataTable>
      </Panel>

      <!-- Performance Chart -->
      <Panel header="Performance Trends" class="dashboard-panel">
        <Chart type="line" :data="performanceData" :options="lineChartOptions" />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import { useLeadStore } from '@/stores/leadStore'
import { useWebSocket } from '@/services/websocket'
import { DateTime } from 'luxon'

// PrimeVue Components
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Timeline from 'primevue/timeline'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Chart from 'primevue/chart'

const router = useRouter()
const store = useLeadStore()
const {
  leadMetrics,
  leadFunnel,
  activityMetrics,
  performanceMetrics,
  conversionMetrics
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
const performanceData = computed(() => ({
  labels: performanceMetrics.value.monthly.map(m => m.month),
  datasets: [
    {
      label: 'New Leads',
      data: performanceMetrics.value.monthly.map(m => m.leads),
      borderColor: '#3e5b82',
      tension: 0.4
    },
    {
      label: 'Completed Tasks',
      data: performanceMetrics.value.monthly.map(m => m.completedTasks),
      borderColor: '#ee9b4c',
      tension: 0.4
    }
  ]
}))

// Chart Options
const doughnutOptions = {
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const lineChartOptions = {
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
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

const weekTasks = computed(() => {
  const startOfWeek = DateTime.now().startOf('week')
  const endOfWeek = startOfWeek.plus({ days: 7 })
  const tasks = store.tasks.filter(task => {
    const taskDate = DateTime.fromISO(task.scheduledDate)
    return taskDate >= startOfWeek && taskDate < endOfWeek
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

// Hot Leads
const hotLeads = computed(() => 
  store.leads
    .filter(lead => 
      lead.status === 'Hot en snel beslissen' || 
      lead.status === 'Hot' ||
      lead.priority >= 8
    )
    .sort((a, b) => b.leadscore - a.leadscore)
    .slice(0, 5)
)

// Recent Activity
const recentActivity = computed(() => {
  const activities: any[] = []

  // Add tasks
  store.tasks.forEach(task => {
    if (task.completed) {
      activities.push({
        type: 'task',
        icon: 'pi pi-check-circle',
        description: `Completed task: ${task.title}`,
        timestamp: task.scheduledDate
      })
    }
  })

  // Add communications
  store.communications.forEach(comm => {
    activities.push({
      type: 'communication',
      icon: comm.type === 'inbound' ? 'pi pi-arrow-down' : 'pi pi-arrow-up',
      description: `${comm.type === 'inbound' ? 'Received' : 'Sent'} ${comm.method}: ${comm.content.substring(0, 50)}...`,
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

const formatPercent = (value: number) => {
  return `${Math.round(value)}%`
}

const formatDate = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd MMM yyyy')
}

const formatDateTime = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd MMM HH:mm')
}

const formatTimeAgo = (date: string) => {
  return DateTime.fromISO(date).toRelative()
}

const refreshData = () => {
  // Implement refresh logic if needed
}

// Lifecycle
onMounted(() => {
  // Initial data load if needed
})
</script>

<style scoped>
.dashboard-view {
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
  margin: 0;
  color: var(--color-primary);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.connection-status i {
  font-size: 1rem;
}

.connection-status small {
  color: #666;
  margin-left: 1rem;
}

.status-connected {
  color: #22c55e;
}

.status-disconnected {
  color: #ef4444;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1rem;
}

.dashboard-panel {
  margin-bottom: 1rem;
}

.lead-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.tasks-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-item label {
  font-weight: 500;
}

.progress-item small {
  color: #666;
}

.activity-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
}

.activity-item i {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin-bottom: 0.25rem;
}

.activity-content small {
  color: #666;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-panel-header) {
  background: #f8f9fa;
}

:deep(.p-progressbar) {
  height: 0.5rem;
}

:deep(.p-datatable-wrapper) {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
