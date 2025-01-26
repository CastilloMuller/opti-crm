export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: string
  priority: number
  leadscore: number
  quotationValue: number
  source: string
  notes: string[]
  createdAt: string
  updatedAt: string
  lastContactDate: string
  nextFollowUp: string
  assignedTo: string
  tags: string[]
}

export interface Task {
  id: string
  leadId: string
  title: string
  description: string
  type: string
  priority: number
  completed: boolean
  scheduledDate: string
  completedDate?: string
  assignedTo: string
  createdAt: string
  updatedAt: string
}

export interface Communication {
  id: string
  leadId: string
  type: 'inbound' | 'outbound'
  method: string
  content: string
  timestamp: string
  outcome?: string
  followUpRequired: boolean
  followUpDate?: string
  attachments?: string[]
  createdBy: string
}

export interface Note {
  id: string
  leadId: string
  content: string
  createdAt: string
  createdBy: string
  type: string
  important: boolean
}

export interface LeadActivity {
  id: string
  leadId: string
  type: string
  description: string
  timestamp: string
  performedBy: string
  metadata?: Record<string, any>
}

export interface LeadScore {
  id: string
  leadId: string
  score: number
  factors: {
    engagement: number
    budget: number
    authority: number
    need: number
    timeline: number
  }
  calculatedAt: string
}

export interface LeadFilter {
  status?: string[]
  priority?: number[]
  source?: string[]
  assignedTo?: string[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface LeadSort {
  field: keyof Lead
  direction: 'asc' | 'desc'
}

export interface LeadAnalytics {
  totalLeads: number
  leadsByStatus: Record<string, number>
  leadsBySource: Record<string, number>
  leadsByPriority: Record<string, number>
  conversionRate: number
  averageLeadScore: number
  totalValue: number
}
