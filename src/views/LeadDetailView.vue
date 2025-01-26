<template>
  <div class="lead-detail-view" v-if="lead">
    <!-- Header -->
    <div class="lead-header">
      <div class="lead-title">
        <h1>{{ lead.name }}</h1>
        <Tag :value="lead.status" :severity="getStatusSeverity(lead.status)" />
      </div>
      <div class="lead-actions">
        <Button icon="pi pi-pencil" @click="showEditDialog = true" class="p-button-text" />
        <Button icon="pi pi-trash" @click="confirmDelete" class="p-button-text p-button-danger" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="lead-content">
      <!-- Left Column: Info & Tasks -->
      <div class="lead-main">
        <!-- Lead Information -->
        <Panel header="Lead Information" class="info-panel">
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <div>{{ lead.email || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <div>{{ lead.phone || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <label>Decision Date</label>
              <div>{{ formatDate(lead.decisionDate) || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <label>Quotation Value</label>
              <div>{{ formatCurrency(lead.quotationValue) || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <label>Priority</label>
              <div>{{ lead.priority || 'Not specified' }}/10</div>
            </div>
            <div class="info-item">
              <label>Success Rate</label>
              <div>{{ lead.successRate || 'Not specified' }}%</div>
            </div>
            <div class="info-item">
              <label>Lead Score</label>
              <div>{{ lead.leadscore }}</div>
            </div>
          </div>
        </Panel>

        <!-- Tasks Section -->
        <Panel header="Tasks" class="tasks-panel">
          <template #icons>
            <Button 
              icon="pi pi-plus" 
              @click="showNewTaskDialog = true"
              class="p-button-text p-button-sm" 
            />
          </template>
          
          <DataTable :value="tasks" class="tasks-table">
            <Column field="type" header="Type">
              <template #body="{ data }">
                <Tag :value="getTaskTypeLabel(data.type)" />
              </template>
            </Column>
            <Column field="title" header="Title" />
            <Column field="scheduledDate" header="Date">
              <template #body="{ data }">
                {{ formatDate(data.scheduledDate) }}
              </template>
            </Column>
            <Column field="completed" header="Status">
              <template #body="{ data }">
                <Checkbox 
                  v-model="data.completed"
                  @change="handleTaskUpdate(data)"
                  :binary="true"
                />
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>

      <!-- Right Column: Communication History -->
      <div class="lead-sidebar">
        <Panel header="Communication History" class="history-panel">
          <template #icons>
            <Button 
              icon="pi pi-plus" 
              @click="showNewCommunicationDialog = true"
              class="p-button-text p-button-sm" 
            />
          </template>

          <Timeline :value="communications" class="history-timeline">
            <template #content="slotProps">
              <div class="timeline-item">
                <small class="timeline-date">
                  {{ formatDate(slotProps.item.timestamp) }}
                </small>
                <div class="timeline-type">
                  {{ slotProps.item.type === 'outbound' ? 'Sent' : 'Received' }}
                  {{ getTaskTypeLabel(slotProps.item.method) }}
                </div>
                <div class="timeline-content">
                  {{ slotProps.item.content }}
                </div>
              </div>
            </template>
          </Timeline>
        </Panel>

        <!-- Notes Section -->
        <Panel header="Notes" class="notes-panel">
          <template #icons>
            <Button 
              icon="pi pi-plus" 
              @click="showNewNoteDialog = true"
              class="p-button-text p-button-sm" 
            />
          </template>

          <div class="notes-container">
            <div 
              v-for="note in notes" 
              :key="note.id"
              class="note-item"
            >
              <div class="note-header">
                <small>{{ formatDate(note.createdAt) }}</small>
                <Button 
                  icon="pi pi-trash" 
                  @click="handleNoteDelete(note.id)"
                  class="p-button-text p-button-danger p-button-sm" 
                />
              </div>
              <div class="note-content">{{ note.content }}</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>

    <!-- Dialogs -->
    <!-- New Task Dialog -->
    <Dialog 
      v-model:visible="showNewTaskDialog"
      modal 
      header="New Task"
      :style="{ width: '450px' }"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="taskType">Type*</label>
          <Dropdown
            id="taskType"
            v-model="newTask.type"
            :options="taskTypes"
            placeholder="Select Type"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="taskTitle">Title*</label>
          <InputText
            id="taskTitle"
            v-model="newTask.title"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="taskDate">Date*</label>
          <Calendar
            id="taskDate"
            v-model="newTask.scheduledDate"
            showTime
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="taskDescription">Description</label>
          <Textarea
            id="taskDescription"
            v-model="newTask.description"
            rows="3"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="showNewTaskDialog = false" class="p-button-text" />
        <Button label="Create" @click="addNewTask" autofocus />
      </template>
    </Dialog>

    <!-- New Communication Dialog -->
    <Dialog 
      v-model:visible="showNewCommunicationDialog"
      modal 
      header="Add Communication"
      :style="{ width: '450px' }"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="commType">Type*</label>
          <Dropdown
            id="commType"
            v-model="newCommunication.type"
            :options="communicationTypes"
            placeholder="Select Type"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="commMethod">Method*</label>
          <Dropdown
            id="commMethod"
            v-model="newCommunication.method"
            :options="taskTypes"
            placeholder="Select Method"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="commContent">Content*</label>
          <Textarea
            id="commContent"
            v-model="newCommunication.content"
            rows="3"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="showNewCommunicationDialog = false" class="p-button-text" />
        <Button label="Add" @click="addNewCommunication" autofocus />
      </template>
    </Dialog>

    <!-- New Note Dialog -->
    <Dialog 
      v-model:visible="showNewNoteDialog"
      modal 
      header="Add Note"
      :style="{ width: '450px' }"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="noteContent">Note Content*</label>
          <Textarea
            id="noteContent"
            v-model="newNote.content"
            rows="4"
            class="w-full"
            autoResize
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="showNewNoteDialog = false" class="p-button-text" />
        <Button label="Add" @click="addNewNote" autofocus />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLeadStore } from '@/stores/leadStore'
import type { TaskType } from '@/types/lead'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const route = useRoute()
const store = useLeadStore()
const confirm = useConfirm()

// Lead data
const lead = computed(() => store.getLeadById(route.params.id as string))

// Tasks
const tasks = computed(() => store.getLeadTasks(route.params.id as string))
const showNewTaskDialog = ref(false)
const newTask = ref({
  type: 'bellen' as TaskType,
  title: '',
  description: '',
  scheduledDate: new Date(),
  completed: false
})

const addNewTask = () => {
  store.addTask({
    leadId: route.params.id as string,
    ...newTask.value
  })
  showNewTaskDialog.value = false
  newTask.value = {
    type: 'bellen',
    title: '',
    description: '',
    scheduledDate: new Date(),
    completed: false
  }
}

const handleTaskUpdate = (task: { id: string } & Partial<{ completed: boolean }>) => {
  store.updateTask(task.id, task)
}

// Notes
const notes = computed(() => 
  store.getLeadNotes(route.params.id as string)
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
)

const showNewNoteDialog = ref(false)
const newNote = ref({
  content: ''
})

const addNewNote = () => {
  store.addNote({
    leadId: route.params.id as string,
    content: newNote.value.content
  })
  showNewNoteDialog.value = false
  newNote.value.content = ''
}

const handleNoteDelete = (noteId: string) => {
  confirm.require({
    message: 'Are you sure you want to delete this note?',
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: () => {
      store.deleteNote(noteId)
    }
  })
}

// Communications
const communications = computed(() =>
  store.getLeadCommunications(route.params.id as string)
    .sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
)

const showNewCommunicationDialog = ref(false)
const newCommunication = ref({
  type: 'outbound' as const,
  method: 'bellen' as TaskType,
  content: ''
})

const addNewCommunication = () => {
  store.addCommunication({
    leadId: route.params.id as string,
    type: newCommunication.value.type,
    method: newCommunication.value.method,
    timestamp: new Date().toISOString(),
    content: newCommunication.value.content
  })
  showNewCommunicationDialog.value = false
  newCommunication.value = {
    type: 'outbound',
    method: 'bellen',
    content: ''
  }
}

const handleCommunicationDelete = (commId: string) => {
  confirm.require({
    message: 'Are you sure you want to delete this communication?',
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: () => {
      store.deleteCommunication(commId)
    }
  })
}

const taskTypes = [
  { label: 'Call', value: 'bellen' },
  { label: 'Meeting', value: 'afspraak' },
  { label: 'Email', value: 'mailen' },
  { label: 'Research', value: 'uitzoeken' }
]

const communicationTypes = [
  { label: 'Outbound', value: 'outbound' },
  { label: 'Inbound', value: 'inbound' }
]

const getTaskTypeLabel = (type: TaskType) => {
  return taskTypes.find(t => t.value === type)?.label || type
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (value: number | undefined) => {
  if (!value) return ''
  return new Intl.NumberFormat('nl-NL', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(value)
}

const getStatusSeverity = (status: string) => {
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

const confirmDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this lead?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Implement delete
      // router.push('/leads')
    }
  })
}

onMounted(() => {
  if (!lead.value) {
    // Handle lead not found
    console.error('Lead not found')
  }
})
</script>

<style scoped>
.lead-detail-view {
  padding: 1rem;
}

.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.lead-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lead-title h1 {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
  margin: 0;
  color: var(--color-primary);
}

.lead-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
  display: block;
}

.tasks-panel {
  margin-top: 1rem;
}

.history-panel {
  margin-bottom: 1rem;
}

.timeline-item {
  padding: 0.5rem 0;
}

.timeline-date {
  color: #666;
  display: block;
  margin-bottom: 0.25rem;
}

.timeline-type {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.timeline-content {
  color: #444;
}

.notes-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-header small {
  color: #666;
}

.note-content {
  white-space: pre-wrap;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}

:deep(.p-panel) {
  margin-bottom: 1rem;
}

:deep(.p-panel-header) {
  background: #f8f9fa;
}

:deep(.p-timeline-event-opposite) {
  display: none;
}

:deep(.p-timeline-event-content) {
  margin-left: 1rem;
}
</style>
