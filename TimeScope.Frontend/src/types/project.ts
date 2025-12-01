export interface Project {
    id: string;
    name: string;
    description?: string;
    groupId?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}

export interface Theme {
    id: string;
    name: string;
    color: string;
    description?: string;
    groupId?: string;
    projectId?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted: boolean;
}
