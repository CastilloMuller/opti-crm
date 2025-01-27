import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/leads',
      name: 'Leads',
      component: () => import('../views/LeadsView.vue')
    },
    {
      path: '/leads/:id',
      name: 'LeadDetail',
      component: () => import('../views/LeadDetailView.vue')
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('../views/TasksView.vue')
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/CalendarView.vue')
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('../views/AnalyticsView.vue')
    }
  ]
})

export default router
