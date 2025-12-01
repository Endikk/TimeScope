import apiClient from '../client';
import { Project, Group, Theme } from '@/types/project';

// DTOs
export interface CreateProjectDto {
  name: string;
  description?: string;
  groupId?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  groupId?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface CreateThemeDto {
  name: string;
  color: string;
  description?: string;
  groupId?: string;
  projectId?: string;
}

export interface UpdateThemeDto {
  name?: string;
  color?: string;
  description?: string;
  groupId?: string;
  projectId?: string;
}

// Service
class ProjectsService {
  private readonly endpoint = '/projects';

  // Projets
  async getAllProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(this.endpoint);
    return response.data;
  }

  async createProject(project: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post<Project>(this.endpoint, project);
    return response.data;
  }

  async updateProject(id: string, project: UpdateProjectDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/${id}`, project);
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  // Groupes
  async getAllGroups(): Promise<Group[]> {
    const response = await apiClient.get<Group[]>(`${this.endpoint}/groups`);
    return response.data;
  }

  async createGroup(group: CreateGroupDto): Promise<Group> {
    const response = await apiClient.post<Group>(`${this.endpoint}/groups`, group);
    return response.data;
  }

  async updateGroup(id: string, group: UpdateGroupDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/groups/${id}`, group);
  }

  async deleteGroup(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/groups/${id}`);
  }

  // Thèmes
  async getAllThemes(): Promise<Theme[]> {
    const response = await apiClient.get<Theme[]>(`${this.endpoint}/themes`);
    return response.data;
  }

  async createTheme(theme: CreateThemeDto): Promise<Theme> {
    const response = await apiClient.post<Theme>(`${this.endpoint}/themes`, theme);
    return response.data;
  }

  async updateTheme(id: string, theme: UpdateThemeDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/themes/${id}`, theme);
  }

  async deleteTheme(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/themes/${id}`);
  }
}

export const projectsService = new ProjectsService();
