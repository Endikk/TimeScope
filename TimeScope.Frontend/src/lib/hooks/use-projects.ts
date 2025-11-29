import { useState, useEffect, useCallback } from 'react';
import {
  projectsService,
  type Project,
  type Group,
  type Theme,
  type CreateProjectDto,
  type UpdateProjectDto,
  type CreateGroupDto,
  type UpdateGroupDto,
  type CreateThemeDto,
  type UpdateThemeDto
} from '@/lib/api/services/projects.service';

/**
 * Hook pour récupérer tous les projets
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}

/**
 * Hook pour récupérer tous les groupes
 */
export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getAllGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  return { groups, loading, error, refetch: fetchGroups };
}

/**
 * Hook pour récupérer tous les thèmes
 */
export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getAllThemes();
      setThemes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des thèmes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, []);

  return { themes, loading, error, refetch: fetchThemes };
}

/**
 * Hook pour les mutations de projets
 */
export function useProjectMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: CreateProjectDto) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectsService.createProject(projectData);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du projet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, projectData: UpdateProjectDto) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.updateProject(id, projectData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du projet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.deleteProject(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du projet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    updateProject,
    deleteProject,
    loading,
    error,
  };
}

/**
 * Hook pour les mutations de groupes
 */
export function useGroupMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (groupData: CreateGroupDto) => {
    try {
      setLoading(true);
      setError(null);
      const newGroup = await projectsService.createGroup(groupData);
      return newGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du groupe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id: string, groupData: UpdateGroupDto) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.updateGroup(id, groupData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du groupe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.deleteGroup(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du groupe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    loading,
    error,
  };
}

/**
 * Hook pour les mutations de thèmes
 */
export function useThemeMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTheme = async (themeData: CreateThemeDto) => {
    try {
      setLoading(true);
      setError(null);
      const newTheme = await projectsService.createTheme(themeData);
      return newTheme;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du thème';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (id: string, themeData: UpdateThemeDto) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.updateTheme(id, themeData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du thème';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTheme = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await projectsService.deleteTheme(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du thème';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createTheme,
    updateTheme,
    deleteTheme,
    loading,
    error,
  };
}
