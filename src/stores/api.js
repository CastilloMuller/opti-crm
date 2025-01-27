const API_URL = import.meta.env.VITE_API_URL || 'https://opti-crm-backend.onrender.com';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://opti-crm-backend.onrender.com';

export const api = {
  async fetchDashboardStats() {
    const response = await fetch(`${API_URL}/api/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  async fetchLeads() {
    const response = await fetch(`${API_URL}/api/leads`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    return response.json();
  },

  async fetchTasks() {
    const response = await fetch(`${API_URL}/api/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  // WebSocket connection
  createWebSocket() {
    return new WebSocket(WS_URL);
  }
};

export { API_URL, WS_URL };
