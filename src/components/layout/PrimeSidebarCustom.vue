<template>
  <aside class="sidebar">
    <div class="logo-container p-4">
      <h2 class="text-xl font-bold text-primary">OptiCRM</h2>
    </div>
    <Menu :model="menuItems" class="border-none w-full" />
  </aside>
</template>

<script setup lang="ts">
import Menu from 'primevue/menu'

const menuItems = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Leads',
    icon: 'pi pi-users',
    to: '/leads'
  },
  {
    label: 'Tasks',
    icon: 'pi pi-check-square',
    to: '/tasks'
  },
  {
    label: 'Calendar',
    icon: 'pi pi-calendar',
    to: '/calendar'
  },
  {
    label: 'Analytics',
    icon: 'pi pi-chart-line',
    to: '/analytics'
  }
]
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--surface-overlay);
  border-right: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
}

.logo-container {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-menu) {
  background: transparent;
  border: none;
  padding: 0.5rem;
  width: 100%;
}

:deep(.p-menu-list) {
  outline: none;
}

:deep(.p-menuitem) {
  margin: 0.25rem 0;
}

:deep(.p-menuitem-link) {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

:deep(.p-menuitem-link:hover) {
  background-color: var(--surface-hover);
}

:deep(.p-menuitem-link.router-link-active) {
  background-color: var(--primary-color);
  color: white;
}

:deep(.p-menuitem-link.router-link-active .p-menuitem-icon),
:deep(.p-menuitem-link.router-link-active .p-menuitem-text) {
  color: white;
}
</style>
