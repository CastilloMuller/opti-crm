<template>
  <div class="leads-toolbar">
    <div class="toolbar-left">
      <Button 
        icon="pi pi-plus" 
        label="New Lead" 
        @click="$emit('new-lead')"
        class="p-button-primary"
      />
    </div>

    <div class="toolbar-filters">
      <Dropdown
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Filter by Status"
        class="status-filter"
        @change="$emit('filter-status', selectedStatus)"
      />
      
      <div class="sort-options">
        <Dropdown
          v-model="selectedSort"
          :options="sortOptions"
          placeholder="Sort by"
          class="sort-dropdown"
          @change="$emit('sort-change', selectedSort)"
        />
        <Button
          :icon="sortAsc ? 'pi pi-sort-up' : 'pi pi-sort-down'"
          @click="toggleSort"
          class="p-button-text"
        />
      </div>
    </div>

    <div class="toolbar-right">
      <Button 
        icon="pi pi-upload" 
        label="Import" 
        class="p-button-secondary"
        @click="$emit('import')"
      />
      <Button 
        icon="pi pi-download" 
        label="Export" 
        class="p-button-secondary"
        @click="$emit('export')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import type { LeadStatus } from '@/types/lead'

const selectedStatus = ref<LeadStatus | null>(null)
const selectedSort = ref('')
const sortAsc = ref(true)

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Hot en snel beslissen', value: 'Hot en snel beslissen' },
  { label: 'Probeer af te ronden', value: 'Probeer af te ronden' },
  { label: 'Goede kans, warm houden', value: 'Goede kans, warm houden' },
  { label: 'Standaard', value: 'Standaard' },
  { label: 'Bellen als niets gehoord', value: 'Bellen als niets gehoord' },
  { label: 'Goede kans', value: 'Goede kans' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Snel beslissen', value: 'Snel beslissen' },
  { label: 'Niets mee doen', value: 'Niets mee doen' },
  { label: 'Wacht op gemeente', value: 'Wacht op gemeente' }
]

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Decision Date', value: 'decisionDate' },
  { label: 'Lead Score', value: 'leadscore' },
  { label: 'Created Date', value: 'createdAt' }
]

const toggleSort = () => {
  sortAsc.value = !sortAsc.value
  emit('sort-direction', sortAsc.value)
}

const emit = defineEmits<{
  'new-lead': []
  'filter-status': [status: LeadStatus | null]
  'sort-change': [field: string]
  'sort-direction': [ascending: boolean]
  'import': []
  'export': []
}>()
</script>

<style scoped>
.leads-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-filter {
  min-width: 200px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-dropdown {
  min-width: 150px;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
}
</style>
