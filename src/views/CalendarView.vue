<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendar</h1>
      <div class="calendar-actions">
        <Button 
          icon="pi pi-plus" 
          label="New Task" 
          @click="showNewTaskDialog = true"
        />
        <div class="view-toggles">
          <SelectButton v-model="viewType" :options="viewOptions" />
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <FullCalendar 
        ref="calendarRef"
        :options="calendarOptions"
      />
    </div>

    <!-- Task Dialog -->
    <Dialog 
      v-model:visible="showTaskDialog"
      :header="dialogMode === 'new' ? 'Create Task' : 'Edit Task'"
      :modal="true"
      class="task-dialog"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="taskType">Type</label>
          <Dropdown
            id="taskType"
            v-model="newTask.type"
            :options="taskTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Type"
          />
        </div>

        <div class="field">
          <label for="taskTitle">Title</label>
          <InputText
            id="taskTitle"
            v-model="newTask.title"
            required
            autofocus
          />
        </div>

        <div class="field">
          <label for="taskDescription">Description</label>
          <Textarea
            id="taskDescription"
            v-model="newTask.description"
            rows="3"
          />
        </div>

        <div class="field">
          <label for="taskStart">Start</label>
          <Calendar
            id="taskStart"
            v-model="newTask.startDate"
            showTime
            required
          />
        </div>

        <div class="field">
          <label for="taskEnd">End</label>
          <Calendar
            id="taskEnd"
            v-model="newTask.endDate"
            showTime
          />
        </div>

        <div class="field" v-if="dialogMode === 'new'">
          <label for="taskLead">Lead</label>
          <Dropdown
            id="taskLead"
            v-model="selectedLead"
            :options="store.leads.value"
            optionLabel="name"
            placeholder="Select Lead"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeDialog"
          class="p-button-text"
        />
        <Button
          :label="dialogMode === 'new' ? 'Create' : 'Update'"
          icon="pi pi-check"
          @click="dialogMode === 'new' ? createTask() : updateTask()"
          :disabled="!newTask.title || !newTask.type || !newTask.startDate || (dialogMode === 'new' && !selectedLead)"
        />
      </template>
    </Dialog>

    <!-- Task Details Dialog -->
    <Dialog 
      v-model:visible="showTaskDetails" 
      :modal="true"
      header="Task Details"
      :style="{ width: '400px' }"
    >
      <div class="task-details" v-if="selectedTask">
        <div class="detail-item">
          <label>Lead:</label>
          <span>{{ getLead(selectedTask.leadId)?.name }}</span>
        </div>
        <div class="detail-item">
          <label>Type:</label>
          <Tag :value="selectedTask.type" />
        </div>
        <div class="detail-item">
          <label>Title:</label>
          <span>{{ selectedTask.title }}</span>
        </div>
        <div class="detail-item">
          <label>Date:</label>
          <span>{{ formatDateTime(selectedTask.scheduledDate) }}</span>
        </div>
        <div class="detail-item" v-if="selectedTask.description">
          <label>Description:</label>
          <p>{{ selectedTask.description }}</p>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <Tag :value="selectedTask.completed ? 'Completed' : 'Pending'" 
               :severity="selectedTask.completed ? 'success' : 'warning'" />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Edit" 
          icon="pi pi-pencil" 
          @click="editTask"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, Task, TaskType } from '@/types/lead'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'

const store = useLeadStore()

// State
const viewType = ref('timeGridWeek')
const showTaskDialog = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
const showTaskDetails = ref(false)
const isEditMode = ref(false)
const selectedLead = ref<Lead | null>(null)
const selectedTask = ref<Task | null>(null)
const newTask = ref({
  type: 'bellen' as TaskType,
  title: '',
  description: '',
  startDate: new Date(),
  endDate: null as Date | null
})
const taskTypes = [
  { label: 'Call', value: 'bellen' },
  { label: 'Meeting', value: 'afspraak' },
  { label: 'Email', value: 'mailen' },
  { label: 'Research', value: 'uitzoeken' }
]
const viewOptions = [
  { label: 'Month', value: 'dayGridMonth' },
  { label: 'Week', value: 'timeGridWeek' },
  { label: 'Day', value: 'timeGridDay' }
]

const getTaskColor = (type: TaskType): { bg: string; border: string; text: string } => {
  switch (type) {
    case 'bellen':
      return { bg: '#4CAF50', border: '#388E3C', text: '#FFFFFF' }
    case 'afspraak':
      return { bg: '#2196F3', border: '#1976D2', text: '#FFFFFF' }
    case 'mailen':
      return { bg: '#FF9800', border: '#F57C00', text: '#000000' }
    case 'uitzoeken':
      return { bg: '#9C27B0', border: '#7B1FA2', text: '#FFFFFF' }
    default:
      return { bg: '#757575', border: '#616161', text: '#FFFFFF' }
  }
}

const calendarEvents = computed<EventInput[]>(() => {
  return store.tasks.value.map(task => {
    const colors = getTaskColor(task.type)
    return {
      id: task.id,
      title: task.title,
      start: task.scheduledDate,
      end: task.scheduledDate,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        type: task.type,
        leadId: task.leadId,
        completed: task.completed,
        description: task.description
      }
    }
  })
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: viewType.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: calendarEvents.value,
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  slotDuration: '00:30:00',
  nowIndicator: true
}))

const handleDateSelect = (selectInfo: { start: Date; end: Date }) => {
  newTask.value.startDate = selectInfo.start
  newTask.value.endDate = selectInfo.end
  dialogMode.value = 'new'
  showTaskDialog.value = true
}

const handleEventClick = (clickInfo: { event: { id: string; extendedProps: { leadId: string } } }) => {
  const task = store.tasks.value.find(t => t.id === clickInfo.event.id)
  if (task) {
    selectedTask.value = task
    selectedLead.value = store.getLeadById(task.leadId)
    dialogMode.value = 'edit'
    showTaskDialog.value = true
  }
}

const handleEventDrop = (dropInfo: { event: { id: string; start: Date; end: Date } }) => {
  store.updateTask(dropInfo.event.id, {
    scheduledDate: dropInfo.event.start.toISOString()
  })
}

const handleEventResize = (resizeInfo: { event: { id: string; start: Date; end: Date } }) => {
  store.updateTask(resizeInfo.event.id, {
    scheduledDate: resizeInfo.event.start.toISOString()
  })
}

const createTask = () => {
  if (selectedLead.value) {
    store.addTask({
      type: newTask.value.type,
      title: newTask.value.title,
      description: newTask.value.description,
      scheduledDate: newTask.value.startDate.toISOString(),
      completed: false,
      leadId: selectedLead.value.id
    })
    closeDialog()
  }
}

const updateTask = () => {
  if (selectedTask.value) {
    store.updateTask(selectedTask.value.id, {
      type: newTask.value.type,
      title: newTask.value.title,
      description: newTask.value.description,
      scheduledDate: newTask.value.startDate.toISOString()
    })
    closeDialog()
  }
}

const closeDialog = () => {
  showTaskDialog.value = false
  selectedTask.value = null
  selectedLead.value = null
  newTask.value = {
    type: 'bellen',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: null
  }
}

const editTask = () => {
  if (selectedTask.value) {
    isEditMode.value = true
    selectedLead.value = store.getLeadById(selectedTask.value.leadId)
    newTask.value = {
      type: selectedTask.value.type,
      title: selectedTask.value.title,
      description: selectedTask.value.description || '',
      startDate: new Date(selectedTask.value.scheduledDate),
      endDate: null
    }
    showTaskDetails.value = false
    showTaskDialog.value = true
  }
}

const getLead = (id: string) => {
  return store.leads.value.find(lead => lead.id === id)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<style>
.calendar-view {
  padding: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.calendar-header h1 {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
  margin: 0;
  color: var(--color-primary);
}

.calendar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.calendar-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Calendar Event Styles */
.calendar-event {
  padding: 2px 4px;
  border-radius: 3px;
}

.calendar-event.completed {
  opacity: 0.7;
  text-decoration: line-through;
}

.event-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.event-type {
  font-size: 0.8em;
  opacity: 0.8;
}

/* Form Styles */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Task Details Styles */
.task-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #666;
}

/* FullCalendar Customizations */
:deep(.fc) {
  font-family: 'Century Gothic', Futura, Arial, sans-serif;
}

:deep(.fc-toolbar-title) {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
}

:deep(.fc-event) {
  cursor: pointer;
}

:deep(.fc-day-today) {
  background-color: #f8f9fa !important;
}

:deep(.fc-timegrid-now-indicator-line) {
  border-color: var(--color-primary);
}

:deep(.fc-timegrid-now-indicator-arrow) {
  border-color: var(--color-primary);
}
</style>
