import { TaskStatus } from '../types';

/**
 * Maps backend task status enum values to frontend display labels
 */
export const taskStatusLabels: Record<TaskStatus, string> = {
  EnAttente: 'En attente',
  EnCours: 'En cours',
  Termine: 'Terminé',
};

/**
 * Maps frontend display labels back to backend enum values
 */
export const taskStatusValues: Record<string, TaskStatus> = {
  'En attente': 'EnAttente',
  'En cours': 'EnCours',
  'Terminé': 'Termine',
};

/**
 * Gets the display label for a task status
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  return taskStatusLabels[status] || status;
}

/**
 * Converts a display label to a task status enum value
 */
export function parseTaskStatus(label: string): TaskStatus {
  return taskStatusValues[label] || 'EnAttente';
}

/**
 * Gets CSS class for task status badge
 */
export function getTaskStatusClass(status: TaskStatus): string {
  const classes: Record<TaskStatus, string> = {
    EnAttente: 'bg-yellow-100 text-yellow-800',
    EnCours: 'bg-blue-100 text-blue-800',
    Termine: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

/**
 * All available task statuses for dropdowns
 */
export const taskStatusOptions = [
  { value: 'EnAttente', label: 'En attente' },
  { value: 'EnCours', label: 'En cours' },
  { value: 'Termine', label: 'Terminé' },
] as const;
