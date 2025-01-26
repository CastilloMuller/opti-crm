<template>
  <div class="app">
    <header>
      <Menubar :model="menuItems" class="menubar">
        <template #end>
          <NotificationCenter />
        </template>
      </Menubar>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { useNotifications } from '@/composables/useNotifications'
import { useWebSocket } from '@/composables/useWebSocket'
import NotificationCenter from '@/components/NotificationCenter.vue'

const { notifications, unreadCount } = useNotifications()
const { isConnected } = useWebSocket()

const menuItems = computed(() => [
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
    label: 'Calendar',
    icon: 'pi pi-calendar',
    to: '/calendar'
  },
  {
    label: 'Analytics',
    icon: 'pi pi-chart-bar',
    to: '/analytics'
  }
])
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.menubar {
  padding: 0.5rem 1rem;
}

main {
  flex: 1;
  overflow: auto;
  background-color: var(--surface-ground);
}
</style>
