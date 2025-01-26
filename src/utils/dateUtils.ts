import { DateTime } from 'luxon'

export const formatDate = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).toFormat('dd MMM yyyy')
}

export const formatDateTime = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).toFormat('dd MMM yyyy HH:mm')
}

export const formatTimeAgo = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).toRelative() || ''
}

export const formatTime = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).toFormat('HH:mm')
}

export const isSameDay = (date1: string, date2: string): boolean => {
  if (!date1 || !date2) return false
  const d1 = DateTime.fromISO(date1)
  const d2 = DateTime.fromISO(date2)
  return d1.hasSame(d2, 'day')
}

export const addDays = (date: string, days: number): string => {
  if (!date) return ''
  return DateTime.fromISO(date).plus({ days }).toISO()
}

export const subtractDays = (date: string, days: number): string => {
  if (!date) return ''
  return DateTime.fromISO(date).minus({ days }).toISO()
}

export const startOfDay = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).startOf('day').toISO()
}

export const endOfDay = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).endOf('day').toISO()
}

export const startOfWeek = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).startOf('week').toISO()
}

export const endOfWeek = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).endOf('week').toISO()
}

export const startOfMonth = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).startOf('month').toISO()
}

export const endOfMonth = (date: string): string => {
  if (!date) return ''
  return DateTime.fromISO(date).endOf('month').toISO()
}

export const isInRange = (date: string, start: string, end: string): boolean => {
  if (!date || !start || !end) return false
  const d = DateTime.fromISO(date)
  const s = DateTime.fromISO(start)
  const e = DateTime.fromISO(end)
  return d >= s && d <= e
}

export const getDaysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0
  const s = DateTime.fromISO(start)
  const e = DateTime.fromISO(end)
  return Math.ceil(e.diff(s, 'days').days)
}

export const getWeeksBetween = (start: string, end: string): number => {
  if (!start || !end) return 0
  const s = DateTime.fromISO(start)
  const e = DateTime.fromISO(end)
  return Math.ceil(e.diff(s, 'weeks').weeks)
}

export const getMonthsBetween = (start: string, end: string): number => {
  if (!start || !end) return 0
  const s = DateTime.fromISO(start)
  const e = DateTime.fromISO(end)
  return Math.ceil(e.diff(s, 'months').months)
}
