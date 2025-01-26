<template>
  <div class="leads-view">
    <h1>Leads</h1>
    
    <LeadsToolbar
      @new-lead="showNewLeadDialog = true"
      @filter-status="filterStatus = $event"
      @sort-change="sortField = $event"
      @sort-direction="sortAscending = $event"
      @import="showImportDialog = true"
      @export="exportLeads"
    />

    <div class="leads-grid">
      <DataTable :value="sortedLeads" @sort="handleSort" responsiveLayout="scroll">
        <Column field="name" header="Name" sortable></Column>
        <Column field="status" header="Status" sortable>
          <template #body="slotProps">
            <Tag :severity="getStatusSeverity(slotProps.data.status)">{{ slotProps.data.status }}</Tag>
          </template>
        </Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="phone" header="Phone" sortable></Column>
        <Column field="decisionDate" header="Decision Date" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.decisionDate) }}
          </template>
        </Column>
        <Column field="quotationValue" header="Quotation Value" sortable>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.quotationValue) }}
          </template>
        </Column>
        <Column field="priority" header="Priority" sortable></Column>
        <Column field="successRate" header="Success Rate" sortable></Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button @click="navigateToLead(slotProps.data)" icon="pi pi-eye" class="p-button-rounded p-button-primary"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- New Lead Dialog -->
    <Dialog
      v-model:visible="showNewLeadDialog"
      modal
      header="New Lead"
      :style="{ width: '50vw' }"
    >
      <div class="new-lead-form">
        <div class="form-field">
          <label for="name">Name*</label>
          <InputText
            id="name"
            v-model="newLead.name"
            required
            autofocus
          />
        </div>

        <div class="form-field">
          <label for="status">Status*</label>
          <Dropdown
            id="status"
            v-model="newLead.status"
            :options="statuses"
            optionLabel="self"
            optionValue="self"
            required
          />
        </div>

        <div class="form-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="newLead.email"
            type="email"
          />
        </div>

        <div class="form-field">
          <label for="phone">Phone</label>
          <InputText
            id="phone"
            v-model="newLead.phone"
          />
        </div>

        <div class="form-field">
          <label for="decisionDate">Decision Date</label>
          <Calendar
            id="decisionDate"
            v-model="newLead.decisionDate"
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
        </div>

        <div class="form-field">
          <label for="quotationValue">Quotation Value</label>
          <InputNumber
            id="quotationValue"
            v-model="newLead.quotationValue"
            mode="currency"
            currency="EUR"
            locale="nl-NL"
          />
        </div>

        <div class="form-field">
          <label for="priority">Priority (1-10)</label>
          <InputNumber
            id="priority"
            v-model="newLead.priority"
            :min="1"
            :max="10"
            showButtons
          />
        </div>

        <div class="form-field">
          <label for="successRate">Success Rate (%)</label>
          <InputNumber
            id="successRate"
            v-model="newLead.successRate"
            :min="0"
            :max="100"
            suffix="%"
            showButtons
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showNewLeadDialog = false"
          class="p-button-text"
        />
        <Button
          label="Create"
          icon="pi pi-check"
          @click="addNewLead"
          :disabled="!newLead.name || !newLead.status"
          autofocus
        />
      </template>
    </Dialog>

    <!-- Import Dialog -->
    <Dialog
      v-model:visible="showImportDialog"
      modal
      header="Import Leads"
      :style="{ width: '40vw' }"
    >
      <FileUpload
        mode="basic"
        accept=".csv"
        :maxFileSize="1000000"
        @upload="importLeads"
        :auto="true"
        chooseLabel="Select CSV File"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead, LeadStatus } from '@/types/lead'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'

const router = useRouter()
const store = useLeadStore()

// Table state
const sortField = ref('')
const sortAscending = ref(true)

// New lead dialog
const showNewLeadDialog = ref(false)
const newLead = ref({
  name: '',
  status: 'Standaard' as LeadStatus,
  email: '',
  phone: '',
  decisionDate: null as Date | null,
  quotationValue: null as number | null,
  priority: null as number | null,
  successRate: null as number | null
})

const statuses: LeadStatus[] = [
  'Probeer af te ronden',
  'Goede kans, warm houden',
  'Standaard',
  'Bellen als niets gehoord',
  'Goede kans',
  'Hot',
  'Snel beslissen',
  'Hot en snel beslissen',
  'Niets mee doen',
  'Wacht op gemeente'
]

const getStatusSeverity = (status: LeadStatus) => {
  const severities: Record<LeadStatus, string> = {
    'Hot en snel beslissen': 'danger',
    'Probeer af te ronden': 'warning',
    'Goede kans, warm houden': 'success',
    'Standaard': 'info',
    'Bellen als niets gehoord': 'warning',
    'Goede kans': 'success',
    'Hot': 'danger',
    'Snel beslissen': 'danger',
    'Niets mee doen': 'info',
    'Wacht op gemeente': 'warning'
  }
  return severities[status]
}

const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (value: number | undefined) => {
  if (!value) return ''
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const handleSort = (event: { field: string; order: number }) => {
  sortField.value = event.field
  sortAscending.value = event.order === 1
}

const sortValue = (a: Lead, b: Lead, field: string): number => {
  const aValue = (a as any)[field]
  const bValue = (b as any)[field]

  if (aValue === bValue) return 0
  if (aValue === undefined || aValue === null) return sortAscending.value ? 1 : -1
  if (bValue === undefined || bValue === null) return sortAscending.value ? -1 : 1

  if (aValue < bValue) return sortAscending.value ? -1 : 1
  if (aValue > bValue) return sortAscending.value ? 1 : -1
  return 0
}

const sortedLeads = computed(() => {
  let sorted = [...store.leads.value]
  if (sortField.value) {
    sorted.sort((a, b) => sortValue(a, b, sortField.value))
  }
  return sorted
})

const addNewLead = () => {
  store.addLead({
    name: newLead.value.name,
    status: newLead.value.status,
    email: newLead.value.email || undefined,
    phone: newLead.value.phone || undefined,
    decisionDate: newLead.value.decisionDate?.toISOString() || undefined,
    quotationValue: newLead.value.quotationValue || undefined,
    priority: newLead.value.priority || undefined,
    successRate: newLead.value.successRate || undefined
  })
  showNewLeadDialog.value = false
  resetNewLead()
}

const resetNewLead = () => {
  newLead.value = {
    name: '',
    status: 'Standaard',
    email: '',
    phone: '',
    decisionDate: null,
    quotationValue: null,
    priority: null,
    successRate: null
  }
}

const navigateToLead = (lead: Lead) => {
  router.push(`/leads/${lead.id}`)
}

const importLeads = (event: any) => {
  // Implementation for CSV import
  const file = event.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    // Process CSV data
    // TODO: Implement CSV processing
  }
  reader.readAsText(file)
}

const exportLeads = () => {
  // Implementation for CSV export
  // TODO: Implement CSV export
}
</script>

<style scoped>
.leads-view {
  padding: 1rem;
}

h1 {
  font-family: 'BankGothic', 'ITC Avant Garde Gothic', 'Arial Black', sans-serif;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.leads-grid {
  padding: 1rem 0;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>
