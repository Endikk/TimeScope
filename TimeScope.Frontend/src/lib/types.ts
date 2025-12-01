// Task Status - Aligned with backend enums
export type { TaskStatus, TaskPrecision, TaskPriority, Task, TaskFilters, TaskStats } from '@/types/task';

// Nouveaux types pour le système de suivi mensuel
export interface DayEntry {
  day: number
  value: number // 0 à 1 (où 1 = 7h de travail)
  isWeekend: boolean
  isToday: boolean
}

export interface ThemeRow {
  id: string
  name: string
  groupe?: string
  projet?: string
  color: string
  days: DayEntry[]
}

export interface MonthData {
  year: number
  month: number
  monthName: string
  daysInMonth: number
  firstDayOfWeek: number
  themes: ThemeRow[]
}

export interface MonthlyProgress {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
  completedDays: number
  progressPercentage: number
}