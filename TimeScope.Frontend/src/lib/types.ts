export type TaskStatus = "En cours" | "Terminé" | "En attente"
export type TaskPrecision = "Low" | "Medium" | "High"

export interface Task {
  id: string
  name: string
  projectId: string
  precision: TaskPrecision
  status: TaskStatus
  timeSpent: string
  assignee: string
  priority?: "Low" | "Medium" | "High"
  dueDate?: string
  description?: string
}

export interface TaskFilters {
  projectId: string
  precision: string
  search: string
}

export interface TaskStats {
  totalTasks: number
  totalTime: string
  activeTeams: number
  completedTasks: number
  collaborators: number
}

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