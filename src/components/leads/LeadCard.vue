<template>
  <Panel :header="lead.name" class="lead-card">
    <template #icons>
      <Button icon="pi pi-pencil" @click="handleEdit" class="p-button-text" />
      <Button icon="pi pi-trash" @click="handleDelete" class="p-button-text p-button-danger" />
    </template>

    <div class="lead-info">
      <div class="info-row">
        <span class="info-label">Status:</span>
        <Tag :severity="getStatusSeverity(lead.status)" :value="lead.status" />
      </div>

      <div class="info-row" v-if="lead.email">
        <span class="info-label">Email:</span>
        <span>{{ lead.email }}</span>
      </div>

      <div class="info-row" v-if="lead.phone">
        <span class="info-label">Phone:</span>
        <span>{{ lead.phone }}</span>
      </div>

      <div class="info-row" v-if="lead.decisionDate">
        <span class="info-label">Decision Date:</span>
        <span>{{ formatDate(lead.decisionDate) }}</span>
      </div>

      <div class="info-row" v-if="lead.quotationValue">
        <span class="info-label">Quotation Value:</span>
        <span>€{{ lead.quotationValue.toLocaleString() }}</span>
      </div>

      <div class="info-row" v-if="lead.priority">
        <span class="info-label">Priority:</span>
        <span>{{ lead.priority }}/10</span>
      </div>

      <div class="info-row" v-if="lead.successRate">
        <span class="info-label">Success Rate:</span>
        <span>{{ lead.successRate }}%</span>
      </div>
    </div>

    <div v-if="incompleteTasks.length > 0" class="tasks-section">
      <h3>Incomplete Tasks</h3>
      <DataTable :value="incompleteTasks" class="p-datatable-sm">
        <Column field="title" header="Task"></Column>
        <Column field="type" header="Type"></Column>
        <Column field="scheduledDate" header="Due Date">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.scheduledDate) }}
          </template>
        </Column>
        <Column header="Complete">
          <template #body="slotProps">
            <Checkbox
              :modelValue="slotProps.data.completed"
              @change="handleTaskComplete(slotProps.data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="sortedNotes.length > 0" class="notes-section">
      <h3>Recent Notes</h3>
      <div v-for="note in sortedNotes.slice(0, 3)" :key="note.id" class="note">
        <div class="note-content">{{ note.content }}</div>
        <div class="note-date">{{ formatDate(note.createdAt) }}</div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead } from '@/types/lead'
import { formatDate } from '@/utils/dateUtils'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'

const props = defineProps<{
  lead: Lead
}>()

const store = useLeadStore()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  emit('delete')
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'new':
      return 'info'
    case 'contacted':
      return 'warning'
    case 'qualified':
      return 'success'
    case 'lost':
      return 'danger'
    default:
      return 'info'
  }
}

const incompleteTasks = computed(() => {
  const tasks = store.getLeadTasks(props.lead.id)
  return tasks.filter(task => !task.completed)
})

const sortedNotes = computed(() => {
  const notes = store.getLeadNotes(props.lead.id)
  return notes.length > 0
    ? notes.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : []
})

const handleTaskComplete = (taskId: string) => {
  store.updateTask(taskId, { completed: true })
}
</script>

<style scoped>
.lead-card {
  margin-bottom: 1rem;
}

.lead-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: bold;
  width: 120px;
  margin-right: 1rem;
}

.tasks-section,
.notes-section {
  margin-top: 1rem;
}

.tasks-section h3,
.notes-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.note {
  padding: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.note:last-child {
  border-bottom: none;
}

.note-content {
  margin-bottom: 0.25rem;
}

.note-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}
</style>
