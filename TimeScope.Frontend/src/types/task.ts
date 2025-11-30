export type TaskStatus = "EnAttente" | "EnCours" | "Termine";
export type TaskPrecision = "Low" | "Medium" | "High";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
    id: string;
    name: string;
    projectId: string;
    precision: TaskPrecision;
    status: TaskStatus;
    timeSpent: string;
    assigneeId?: string;
    assignee?: string;
    priority?: TaskPriority;
    dueDate?: string;
    description?: string;
    estimatedTime?: string;
    actualTime?: string;
}

export interface TaskFilters {
    projectId: string;
    precision: string;
    search: string;
}

export interface TaskStats {
    totalTasks: number;
    totalTime: string;
    activeTeams: number;
    completedTasks: number;
    collaborators: number;
}
