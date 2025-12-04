import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  projectsService,
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
  const { data: projects = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getAllProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { projects, loading, error: error ? (error as Error).message : null, refetch };
}

/**
 * Hook pour récupérer tous les groupes
 */
export function useGroups() {
  const { data: groups = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: () => projectsService.getAllGroups(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { groups, loading, error: error ? (error as Error).message : null, refetch };
}

/**
 * Hook pour récupérer tous les thèmes
 */
export function useThemes() {
  const { data: themes = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['themes'],
    queryFn: () => projectsService.getAllThemes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { themes, loading, error: error ? (error as Error).message : null, refetch };
}

/**
 * Hook pour les mutations de projets
 */
export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: (projectData: CreateProjectDto) => projectsService.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) => projectsService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject: createProjectMutation.mutateAsync,
    updateProject: (id: string, data: UpdateProjectDto) => updateProjectMutation.mutateAsync({ id, data }),
    deleteProject: deleteProjectMutation.mutateAsync,
    loading: createProjectMutation.isPending || updateProjectMutation.isPending || deleteProjectMutation.isPending,
    error: createProjectMutation.error || updateProjectMutation.error || deleteProjectMutation.error,
  };
}

/**
 * Hook pour les mutations de groupes
 */
export function useGroupMutations() {
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: (groupData: CreateGroupDto) => projectsService.createGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) => projectsService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  return {
    createGroup: createGroupMutation.mutateAsync,
    updateGroup: (id: string, data: UpdateGroupDto) => updateGroupMutation.mutateAsync({ id, data }),
    deleteGroup: deleteGroupMutation.mutateAsync,
    loading: createGroupMutation.isPending || updateGroupMutation.isPending || deleteGroupMutation.isPending,
    error: createGroupMutation.error || updateGroupMutation.error || deleteGroupMutation.error,
  };
}

/**
 * Hook pour les mutations de thèmes
 */
export function useThemeMutations() {
  const queryClient = useQueryClient();

  const createThemeMutation = useMutation({
    mutationFn: (themeData: CreateThemeDto) => projectsService.createTheme(themeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateThemeDto }) => projectsService.updateTheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  return {
    createTheme: createThemeMutation.mutateAsync,
    updateTheme: (id: string, data: UpdateThemeDto) => updateThemeMutation.mutateAsync({ id, data }),
    deleteTheme: deleteThemeMutation.mutateAsync,
    loading: createThemeMutation.isPending || updateThemeMutation.isPending || deleteThemeMutation.isPending,
    error: createThemeMutation.error || updateThemeMutation.error || deleteThemeMutation.error,
  };
}
