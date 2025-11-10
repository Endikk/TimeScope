// Task Status - Aligned with backend enums
export type TaskStatus = "EnAttente" | "EnCours" | "Termine"
export type TaskPrecision = "Low" | "Medium" | "High"
export type TaskPriority = "Low" | "Medium" | "High"

export interface Task {
  id: string
  name: string
  projectId: string
  precision: TaskPrecision
  status: TaskStatus
  timeSpent: string
  assigneeId?: string // Changed from 'assignee: string' to match backend
  assignee?: string // Display name for UI (populated from backend)
  priority?: TaskPriority
  dueDate?: string
  description?: string
  estimatedTime?: string
  actualTime?: string
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