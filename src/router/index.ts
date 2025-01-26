import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/leads',
      component: () => import('@/views/LeadsView.vue')
    },
    {
      path: '/leads/:id',
      component: () => import('@/views/LeadDetailView.vue')
    },
    {
      path: '/calendar',
      component: () => import('@/views/CalendarView.vue')
    },
    {
      path: '/analytics',
      component: () => import('@/views/AnalyticsView.vue')
    }
  ]
})

export default router
