import type { Lead, Task, Note, Communication } from './lead'

export interface LeadStore {
  leads: Lead[]
  tasks: Task[]
  notes: Note[]
  communications: Communication[]
  
  // Lead methods
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadById: (id: string) => Lead | undefined
  
  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  getLeadTasks: (leadId: string) => Task[]
  
  // Note methods
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void
  getLeadNotes: (leadId: string) => Note[]
  
  // Communication methods
  addCommunication: (comm: Omit<Communication, 'id'>) => void
  updateCommunication: (id: string, comm: Partial<Communication>) => void
  deleteCommunication: (id: string) => void
  getLeadCommunications: (leadId: string) => Communication[]
}

export interface ActivityMetrics {
  taskCompletion: {
    last30Days: {
      completed: Task[]
      pending: Task[]
      total: number
      completionRate: number
    }
    thisWeek: {
      completed: Task[]
      pending: Task[]
      total: number
      completionRate: number
    }
  }
  communicationStats: {
    last30Days: Communication[]
    thisWeek: Communication[]
    byType: Record<Communication['type'], number>
    byMethod: Record<Communication['method'], number>
  }
}

export interface LeadMetrics {
  totalLeads: number
  activeLeads: number
  conversionRate: number
  averageLeadScore: number
  statusCounts: Record<Lead['status'], number>
  valueByStatus: Record<Lead['status'], number>
  leadsByPriority: {
    high: Lead[]
    medium: Lead[]
    low: Lead[]
  }
}
