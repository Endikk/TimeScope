export interface TimeEntry {
    id: string;
    taskId: string;
    userId: string;
    date: string;
    duration: string; // Format: "HH:mm:ss"
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}
