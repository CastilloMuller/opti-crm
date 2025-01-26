import { useAnalytics } from './useAnalytics'
import { useLeadStore } from '@/stores/leadStore'
import { DateTime } from 'luxon'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function useReports() {
  const analytics = useAnalytics()
  const store = useLeadStore()

  // Helper Functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return DateTime.fromISO(date).toFormat('dd MMM yyyy')
  }

  const formatDateTime = (date: string) => {
    return DateTime.fromISO(date).toFormat('dd MMM yyyy HH:mm')
  }

  // CSV Export Functions
  const exportLeadsToCSV = () => {
    const leads = store.leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Status: lead.status,
      'Decision Date': formatDate(lead.decisionDate),
      'Quotation Value': formatCurrency(lead.quotationValue || 0),
      Priority: lead.priority,
      'Success Rate': `${lead.successRate}%`,
      'Lead Score': lead.leadscore,
      'Created At': formatDateTime(lead.createdAt)
    }))

    const csv = Papa.unparse(leads)
    downloadCSV(csv, 'leads_export.csv')
  }

  const exportTasksToCSV = () => {
    const tasks = store.tasks.map(task => ({
      'Lead Name': store.getLeadById.value(task.leadId)?.name || '',
      Type: task.type,
      Title: task.title,
      Description: task.description,
      'Scheduled Date': formatDateTime(task.scheduledDate),
      Status: task.completed ? 'Completed' : 'Pending'
    }))

    const csv = Papa.unparse(tasks)
    downloadCSV(csv, 'tasks_export.csv')
  }

  const exportCommunicationsToCSV = () => {
    const communications = store.communications.map(comm => ({
      'Lead Name': store.getLeadById.value(comm.leadId)?.name || '',
      Type: comm.type,
      Method: comm.method,
      Content: comm.content,
      Timestamp: formatDateTime(comm.timestamp)
    }))

    const csv = Papa.unparse(communications)
    downloadCSV(csv, 'communications_export.csv')
  }

  // PDF Export Functions
  const generateAnalyticsReport = () => {
    const doc = new jsPDF()
    const now = DateTime.now().toFormat('dd MMM yyyy')

    // Title
    doc.setFontSize(20)
    doc.text('OptiCRM Analytics Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated on ${now}`, 20, 30)

    // Lead Funnel
    doc.setFontSize(16)
    doc.text('Lead Funnel', 20, 45)
    const funnelData = Object.entries(analytics.leadFunnel.value).map(([stage, data]) => [
      stage,
      data.count.toString(),
      `${data.percentage.toFixed(1)}%`
    ])
    doc.autoTable({
      startY: 50,
      head: [['Stage', 'Count', 'Percentage']],
      body: funnelData
    })

    // Task Statistics
    const currentY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(16)
    doc.text('Task Statistics', 20, currentY)
    const taskData = [
      ['Completed Tasks', analytics.taskStats.value.completed.toString()],
      ['In Progress Tasks', analytics.taskStats.value.inProgress.toString()]
    ]
    doc.autoTable({
      startY: currentY + 5,
      head: [['Metric', 'Value']],
      body: taskData
    })

    // Communication Statistics
    const commY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(16)
    doc.text('Communication Statistics', 20, commY)
    const commData = [
      ['Outbound Communications', analytics.communicationStats.value.byType.outbound.toString()],
      ['Inbound Communications', analytics.communicationStats.value.byType.inbound.toString()]
    ]
    doc.autoTable({
      startY: commY + 5,
      head: [['Type', 'Count']],
      body: commData
    })

    // Revenue Statistics
    const revenueY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(16)
    doc.text('Revenue Statistics', 20, revenueY)
    const revenueData = analytics.revenueStats.value.months.map((month, index) => [
      month,
      `$${analytics.revenueStats.value.values[index].toLocaleString()}`
    ])
    doc.autoTable({
      startY: revenueY + 5,
      head: [['Month', 'Revenue']],
      body: revenueData
    })

    // Save the PDF
    doc.save('opticrm-analytics-report.pdf')
  }

  const exportLeadDetailToPDF = async (leadId: string) => {
    const lead = store.getLeadById.value(leadId)
    if (!lead) return

    const leadTasks = store.getLeadTasks.value(leadId)
    const leadCommunications = store.getLeadCommunications.value(leadId)
    const leadNotes = store.getLeadNotes.value(leadId)

    const docDefinition = {
      content: [
        // Lead Header
        {
          text: lead.name,
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            {
              width: 'auto',
              text: [
                { text: 'Status: ', bold: true },
                lead.status
              ]
            },
            {
              width: 'auto',
              text: [
                { text: 'Lead Score: ', bold: true },
                lead.leadscore.toString()
              ]
            }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 20]
        },

        // Lead Details
        {
          text: 'Lead Details',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Field', 'Value'],
              ['Email', lead.email || 'Not specified'],
              ['Phone', lead.phone || 'Not specified'],
              ['Decision Date', formatDate(lead.decisionDate)],
              ['Quotation Value', formatCurrency(lead.quotationValue || 0)],
              ['Priority', `${lead.priority}/10`],
              ['Success Rate', `${lead.successRate}%`]
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Tasks
        {
          text: 'Tasks',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              ['Type', 'Title', 'Date', 'Status'],
              ...leadTasks.map(task => [
                task.type,
                task.title,
                formatDateTime(task.scheduledDate),
                task.completed ? 'Completed' : 'Pending'
              ])
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Communications
        {
          text: 'Communications',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto'],
            body: [
              ['Type', 'Method', 'Content', 'Date'],
              ...leadCommunications.map(comm => [
                comm.type,
                comm.method,
                comm.content,
                formatDateTime(comm.timestamp)
              ])
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Notes
        {
          text: 'Notes',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Content', 'Date'],
              ...leadNotes.map(note => [
                note.content,
                formatDateTime(note.createdAt)
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: '#3e5b82'
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          color: '#3e5b82'
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    }

    pdfMake.createPdf(docDefinition).download(`lead_report_${lead.name}.pdf`)
  }

  // Utility Functions
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return {
    exportLeadsToCSV,
    exportTasksToCSV,
    exportCommunicationsToCSV,
    generateAnalyticsReport,
    exportLeadDetailToPDF
  }
}
