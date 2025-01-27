<template>
  <div class="grid">
    <!-- Task Stats -->
    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Total Tasks</span>
            <div class="text-900 font-medium text-xl">{{ stats.total }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-check-square text-blue-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">{{ stats.completed }} completed </span>
        <span class="text-500">this week</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Overdue</span>
            <div class="text-900 font-medium text-xl">{{ stats.overdue }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500">Requires immediate attention</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Due Today</span>
            <div class="text-900 font-medium text-xl">{{ stats.dueToday }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-clock text-cyan-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500">Tasks due in the next 24h</span>
      </div>
    </div>

    <div class="col-12 md:col-6 lg:col-3">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Completion Rate</span>
            <div class="text-900 font-medium text-xl">{{ stats.completionRate }}%</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-chart-line text-purple-500 text-xl"></i>
          </div>
        </div>
        <span class="text-{{ stats.completionTrend > 0 ? 'green' : 'red' }}-500 font-medium">{{ Math.abs(stats.completionTrend) }}% </span>
        <span class="text-500">vs last week</span>
      </div>
    </div>

    <!-- Task List -->
    <div class="col-12">
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex justify-content-between align-items-center mb-5">
          <h3>Tasks</h3>
          <div class="flex gap-2">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters.search" placeholder="Search tasks..." />
            </span>
            <Button label="New Task" icon="pi pi-plus" @click="openNewTaskDialog" />
          </div>
        </div>

        <DataTable :value="filteredTasks" 
          v-model:selection="selectedTasks"
          :paginator="true" 
          :rows="10"
          dataKey="id"
          :filters="filters"
          filterDisplay="menu"
          :loading="loading"
          :rowsPerPageOptions="[5,10,20,50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tasks"
          class="p-datatable-sm">
          
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          
          <Column field="title" header="Task" style="min-width:200px">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="slotProps.data.completed" :binary="true" />
                <span :class="{ 'line-through text-500': slotProps.data.completed }">
                  {{ slotProps.data.title }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="priority" header="Priority" style="width:120px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.priority" :severity="getPrioritySeverity(slotProps.data.priority)" />
            </template>
          </Column>

          <Column field="dueDate" header="Due Date" style="width:150px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.dueDate) }}
            </template>
          </Column>

          <Column field="assignee" header="Assignee" style="width:200px">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Avatar :label="getInitials(slotProps.data.assignee)" size="small" shape="circle" />
                <span>{{ slotProps.data.assignee }}</span>
              </div>
            </template>
          </Column>

          <Column field="status" header="Status" style="width:150px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
            </template>
          </Column>

          <Column style="width:100px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" text rounded @click="editTask(slotProps.data)" />
                <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteTask(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <!-- Task Dialog -->
  <Dialog v-model:visible="taskDialog" :header="dialogMode === 'new' ? 'New Task' : 'Edit Task'" modal class="p-fluid" :style="{width: '450px'}">
    <div class="field">
      <label for="title">Title</label>
      <InputText id="title" v-model.trim="task.title" required autofocus :class="{'p-invalid': submitted && !task.title}" />
      <small class="p-error" v-if="submitted && !task.title">Title is required.</small>
    </div>

    <div class="field">
      <label for="description">Description</label>
      <Textarea id="description" v-model="task.description" rows="3" />
    </div>

    <div class="formgrid grid">
      <div class="field col">
        <label for="priority">Priority</label>
        <Dropdown id="priority" v-model="task.priority" :options="priorities" optionLabel="label" optionValue="value" placeholder="Select Priority" />
      </div>

      <div class="field col">
        <label for="status">Status</label>
        <Dropdown id="status" v-model="task.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select Status" />
      </div>
    </div>

    <div class="formgrid grid">
      <div class="field col">
        <label for="dueDate">Due Date</label>
        <Calendar id="dueDate" v-model="task.dueDate" showTime hourFormat="24" />
      </div>

      <div class="field col">
        <label for="assignee">Assignee</label>
        <Dropdown id="assignee" v-model="task.assignee" :options="users" optionLabel="name" optionValue="name" placeholder="Select Assignee" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" @click="saveTask" />
    </template>
  </Dialog>

  <ConfirmDialog></ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { DateTime } from 'luxon'

// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Checkbox from 'primevue/checkbox'

const confirm = useConfirm()
const toast = useToast()

// Stats
const stats = ref({
  total: 45,
  completed: 32,
  overdue: 5,
  dueToday: 8,
  completionRate: 71,
  completionTrend: 5
})

// Tasks Data
const tasks = ref([
  {
    id: 1,
    title: 'Follow up with client',
    description: 'Schedule a call to discuss proposal',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date('2025-01-28'),
    assignee: 'John Doe',
    completed: false
  },
  {
    id: 2,
    title: 'Prepare presentation',
    description: 'Create slides for next week\'s meeting',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: new Date('2025-01-29'),
    assignee: 'Jane Smith',
    completed: false
  }
])

// UI State
const loading = ref(false)
const taskDialog = ref(false)
const dialogMode = ref('new')
const submitted = ref(false)
const selectedTasks = ref([])
const filters = ref({
  search: '',
  global: { value: null, matchMode: 'contains' }
})

// Form Data
const task = ref({
  id: null,
  title: '',
  description: '',
  priority: null,
  status: null,
  dueDate: null,
  assignee: null,
  completed: false
})

// Options
const priorities = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
]

const statuses = [
  { label: 'Not Started', value: 'Not Started' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'On Hold', value: 'On Hold' }
]

const users = [
  { name: 'John Doe' },
  { name: 'Jane Smith' },
  { name: 'Mike Johnson' }
]

// Computed
const filteredTasks = computed(() => {
  if (!filters.value.search) return tasks.value
  
  const searchTerm = filters.value.search.toLowerCase()
  return tasks.value.filter(task => 
    task.title.toLowerCase().includes(searchTerm) ||
    task.description?.toLowerCase().includes(searchTerm) ||
    task.assignee.toLowerCase().includes(searchTerm)
  )
})

// Methods
const openNewTaskDialog = () => {
  task.value = {
    id: null,
    title: '',
    description: '',
    priority: null,
    status: 'Not Started',
    dueDate: null,
    assignee: null,
    completed: false
  }
  submitted.value = false
  taskDialog.value = true
  dialogMode.value = 'new'
}

const editTask = (data: any) => {
  task.value = { ...data }
  taskDialog.value = true
  dialogMode.value = 'edit'
}

const hideDialog = () => {
  taskDialog.value = false
  submitted.value = false
}

const saveTask = () => {
  submitted.value = true

  if (!task.value.title?.trim()) {
    return
  }

  if (task.value.id) {
    const index = tasks.value.findIndex(t => t.id === task.value.id)
    tasks.value[index] = task.value
    toast.add({ severity: 'success', summary: 'Success', detail: 'Task Updated', life: 3000 })
  } else {
    task.value.id = tasks.value.length + 1
    tasks.value.push(task.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Task Created', life: 3000 })
  }

  taskDialog.value = false
  task.value = {
    id: null,
    title: '',
    description: '',
    priority: null,
    status: null,
    dueDate: null,
    assignee: null,
    completed: false
  }
}

const confirmDeleteTask = (data: any) => {
  confirm.require({
    message: 'Are you sure you want to delete this task?',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTask(data)
  })
}

const deleteTask = (data: any) => {
  tasks.value = tasks.value.filter(t => t.id !== data.id)
  toast.add({ severity: 'success', summary: 'Success', detail: 'Task Deleted', life: 3000 })
}

const formatDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat('dd LLL yyyy')
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('')
}

const getPrioritySeverity = (priority: string) => {
  const map: { [key: string]: string } = {
    'High': 'danger',
    'Medium': 'warning',
    'Low': 'success'
  }
  return map[priority]
}

const getStatusSeverity = (status: string) => {
  const map: { [key: string]: string } = {
    'Not Started': 'secondary',
    'In Progress': 'info',
    'Completed': 'success',
    'On Hold': 'warning'
  }
  return map[status]
}

// Lifecycle
onMounted(() => {
  // Load tasks from API
})
</script>

<style scoped>
:deep(.p-datatable-wrapper) {
  min-height: 400px;
}

h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.line-through {
  text-decoration: line-through;
}
</style>
