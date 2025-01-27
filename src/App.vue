<template>
  <div class="app-container">
    <PrimeSidebarCustom />
    <div class="main-content">
      <PrimeTopbar />
      <div class="content-wrapper p-4">
        <RouterView />
      </div>
    </div>
    <Toast position="bottom-right" />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import PrimeSidebarCustom from '@/components/layout/PrimeSidebarCustom.vue'
import PrimeTopbar from '@/components/layout/PrimeTopbar.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useWebSocket } from '@/composables/useWebSocket'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const { notifications, unreadCount } = useNotifications()
const { isConnected } = useWebSocket()
</script>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-wrapper {
  flex: 1;
  background-color: var(--surface-section);
  border-radius: 12px;
  margin: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

:root {
  --primary-color: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #60a5fa;
}
</style>
