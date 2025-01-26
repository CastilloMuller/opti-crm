<template>
  <div class="analytics-view">
    <div class="analytics-header">
      <h1>Analytics Dashboard</h1>
      <div class="header-actions">
        <div class="period-selector">
          <Dropdown
            v-model="selectedPeriod"
            :options="periodOptions"
            optionLabel="label"
            placeholder="Select Period"
          />
        </div>
        <SplitButton 
          label="Export" 
          icon="pi pi-download"
          :model="exportItems"
          class="p-button-outlined"
        />
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Total Leads</div>
        <div class="metric-value">{{ leadMetrics.total }}</div>
        <div class="metric-subtitle">
          Value: {{ formatCurrency(leadMetrics.totalValue) }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Conversion Rate</div>
        <div class="metric-value">{{ formatPercent(conversionMetrics.conversionRate) }}</div>
        <div class="metric-subtitle">
          {{ conversionMetrics.highPriorityLeads }} High Priority Leads
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Task Completion</div>
        <div class="metric-value">
          {{ formatPercent(activityMetrics.taskCompletion.completed / activityMetrics.taskCompletion.total * 100) }}
        </div>
        <div class="metric-subtitle">
          {{ activityMetrics.taskCompletion.completed }}/{{ activityMetrics.taskCompletion.total }} Tasks
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Avg Lead Score</div>
        <div class="metric-value">{{ formatNumber(leadMetrics.avgScore) }}</div>
        <div class="metric-subtitle">
          Avg Value: {{ formatCurrency(leadMetrics.avgValue) }}
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Lead Funnel -->
      <Panel header="Lead Funnel" class="chart-panel">
        <Chart type="funnel" :data="funnelChartData" :options="funnelChartOptions" />
      </Panel>

      <!-- Monthly Performance -->
      <Panel header="Monthly Performance" class="chart-panel">
        <Chart type="line" :data="performanceChartData" :options="performanceChartOptions" />
      </Panel>

      <!-- Task Distribution -->
      <Panel header="Task Distribution" class="chart-panel">
        <Chart type="pie" :data="taskDistributionData" :options="pieChartOptions" />
      </Panel>

      <!-- Communication Activity -->
      <Panel header="Communication Activity" class="chart-panel">
        <Chart type="bar" :data="communicationChartData" :options="barChartOptions" />
      </Panel>
    </div>

    <!-- Detailed Analytics -->
    <TabView>
      <!-- Lead Quality Analysis -->
      <TabPanel header="Lead Quality Analysis">
        <DataTable :value="qualityScoreTrends.all" :paginator="true" :rows="10"
                  sortField="score" :sortOrder="-1" class="analytics-table">
          <Column field="name" header="Lead Name" sortable />
          <Column field="score" header="Quality Score" sortable>
            <template #body="{ data }">
              <ProgressBar :value="data.score" :showValue="true" />
            </template>
          </Column>
          <Column field="value" header="Value" sortable>
            <template #body="{ data }">
              {{ formatCurrency(data.value) }}
            </template>
          </Column>
          <Column field="priority" header="Priority" sortable />
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Activity Timeline -->
      <TabPanel header="Activity Timeline">
        <Timeline :value="activityTimeline" class="activity-timeline">
          <template #content="slotProps">
            <div class="activity-item">
              <small class="activity-date">{{ formatDate(slotProps.item.date) }}</small>
              <div class="activity-content">
                <i :class="slotProps.item.icon"></i>
                {{ slotProps.item.description }}
              </div>
              <Tag :value="slotProps.item.type" :severity="slotProps.item.severity" />
            </div>
          </template>
        </Timeline>
      </TabPanel>

      <!-- Performance Metrics -->
      <TabPanel header="Performance Metrics">
        <div class="performance-grid">
          <div v-for="metric in performanceMetrics.monthly" :key="metric.month" class="performance-card">
            <h3>{{ metric.month }}</h3>
            <div class="performance-stats">
              <div class="stat-item">
                <label>New Leads</label>
                <span>{{ metric.leads }}</span>
              </div>
              <div class="stat-item">
                <label>Tasks Completed</label>
                <span>{{ metric.completedTasks }}/{{ metric.tasks }}</span>
              </div>
              <div class="stat-item">
                <label>Communications</label>
                <span>{{ metric.communications }}</span>
              </div>
              <div class="stat-item">
                <label>Value</label>
                <span>{{ formatCurrency(metric.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useReports } from '@/composables/useReports'
import { DateTime } from 'luxon'

// PrimeVue Components
import Panel from 'primevue/panel'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dropdown from 'primevue/dropdown'
import SplitButton from 'primevue/splitbutton'

const {
  leadMetrics,
  leadFunnel,
  activityMetrics,
  performanceMetrics,
  conversionMetrics,
  taskDistribution,
  qualityScoreTrends
} = useAnalytics()

const reports = useReports()

// Period Selection
const selectedPeriod = ref({ label: 'Last 30 Days', value: 30 })
const periodOptions = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'This Year', value: 365 }
]

// Export Menu Items
const exportItems = [
  {
    label: 'Export Analytics Report (PDF)',
    icon: 'pi pi-file-pdf',
    command: () => reports.exportAnalyticsToPDF()
  },
  {
    label: 'Export Leads (CSV)',
    icon: 'pi pi-file-excel',
    command: () => reports.exportLeadsToCSV()
  },
  {
    label: 'Export Tasks (CSV)',
    icon: 'pi pi-file-excel',
    command: () => reports.exportTasksToCSV()
  },
  {
    label: 'Export Communications (CSV)',
    icon: 'pi pi-file-excel',
    command: () => reports.exportCommunicationsToCSV()
  }
]

// Chart Data
const funnelChartData = computed(() => ({
  labels: leadFunnel.value.map(item => item.stage),
  datasets: [{
    data: leadFunnel.value.map(item => item.count),
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

const performanceChartData = computed(() => ({
  labels: performanceMetrics.value.monthly.map(m => m.month),
  datasets: [
    {
      label: 'Leads',
      data: performanceMetrics.value.monthly.map(m => m.leads),
      borderColor: '#3e5b82',
      tension: 0.4
    },
    {
      label: 'Tasks Completed',
      data: performanceMetrics.value.monthly.map(m => m.completedTasks),
      borderColor: '#ee9b4c',
      tension: 0.4
    }
  ]
}))

const taskDistributionData = computed(() => ({
  labels: Object.keys(taskDistribution.value.byType),
  datasets: [{
    data: Object.values(taskDistribution.value.byType),
    backgroundColor: ['#3e5b82', '#ee9b4c', '#f9cca1', '#90c2dd']
  }]
}))

const communicationChartData = computed(() => {
  const data = activityMetrics.value.communicationStats.byTypeLast30Days
  return {
    labels: Object.keys(data),
    datasets: [{
      label: 'Communications',
      data: Object.values(data),
      backgroundColor: '#3e5b82'
    }]
  }
})

// Chart Options
const funnelChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

const performanceChartOptions = {
  maintainAspectRatio: false,
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

const pieChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const barChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Activity Timeline
const activityTimeline = computed(() => {
  const timeline: any[] = []
  // Add tasks
  activityMetrics.value.taskCompletion.last30Days.completed.forEach(task => {
    timeline.push({
      date: task.scheduledDate,
      type: 'Task',
      description: `Completed: ${task.title}`,
      icon: 'pi pi-check-circle',
      severity: 'success'
    })
  })
  // Add communications
  activityMetrics.value.communicationStats.last30Days.forEach(comm => {
    timeline.push({
      date: comm.timestamp,
      type: comm.type,
      description: `${comm.method}: ${comm.content.substring(0, 50)}...`,
      icon: 'pi pi-comments',
      severity: comm.type === 'inbound' ? 'info' : 'warning'
    })
  })
  return timeline.sort((a, b) => 
    DateTime.fromISO(b.date).toMillis() - DateTime.fromISO(a.date).toMillis()
  )
})

// Utility Functions
function formatCurrency(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatNumber(value: number) {
  return Math.round(value * 10) / 10
}

function formatDate(date: string) {
  return DateTime.fromISO(date).toFormat('dd MMM yyyy HH:mm')
}

function getStatusSeverity(status: string) {
  const severities: Record<string, string> = {
    'Hot en snel beslissen': 'danger',
    'Hot': 'danger',
    'Snel beslissen': 'warning',
    'Goede kans': 'success',
    'Goede kans, warm houden': 'success',
    'Standaard': 'info',
    'Niets mee doen': 'secondary'
  }
  return severities[status] || 'info'
}

// Lifecycle
onMounted(() => {
  // Initialize charts
})
</script>

<style scoped>
.analytics-view {
  padding: 1rem;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.analytics-header h1 {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
  margin: 0;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #666;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.chart-panel {
  height: 400px;
}

:deep(.p-panel-content) {
  height: calc(100% - 50px);
}

.analytics-table {
  margin-top: 1rem;
}

.activity-timeline {
  margin-top: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-date {
  color: #666;
  width: 150px;
}

.activity-content {
  flex: 1;
}

.activity-content i {
  margin-right: 0.5rem;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.performance-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.performance-card h3 {
  margin: 0 0 1rem 0;
  color: var(--color-primary);
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-item span {
  font-weight: 500;
}
</style>
