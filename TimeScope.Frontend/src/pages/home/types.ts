export type { Group, Project } from '@/types/project';
export type { Task } from '@/types/task';

export interface LocalTimeEntry {
    id: string
    date: string
    groupeId: string
    groupeName: string
    projetId: string
    projetName: string
    themeId: string
    themeName: string
    taskId: string
    taskName: string
    heures: number
    description: string
    status: 'draft' | 'saved'
}

export interface NewTimeEntry {
    groupeId: string
    projetId: string
    themeId: string
    taskId: string
    heures: number
    description: string
}
