import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsQuery,
  ListProjectsResponse,
  UpdateProgressRequest,
  ProjectStats,
} from '@/types/api';

// Hook para listar projetos
export function useProjects(params?: ListProjectsQuery) {
  const queryClient = useQueryClient();

  const queryParams = {
    page: 1,
    limit: 10,
    ...params,
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: async () => {
      const response = await api.get<ListProjectsResponse>('/projects', queryParams);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar projeto
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      const response = await api.post<Project>('/projects', data);
      return response;
    },
    onSuccess: (newProject) => {
      // Atualiza a lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Adiciona o novo projeto ao cache atual
      queryClient.setQueryData(['projects', queryParams], (old: ListProjectsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          projects: [newProject, ...old.projects],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });
    },
  });

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProjectRequest }) => {
      const response = await api.put<Project>(`/projects/${id}`, data);
      return response;
    },
    onSuccess: (updatedProject) => {
      // Atualiza a lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Atualiza o cache do projeto específico
      queryClient.setQueryData(['project', updatedProject.id], updatedProject);
    },
  });

  // Mutation para excluir projeto
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await api.delete(`/projects/${projectId}`);
      return response;
    },
    onSuccess: (_, projectId) => {
      // Atualiza a lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Remove do cache
      queryClient.removeQueries({ queryKey: ['project', projectId] });
    },
  });

  // Mutation para alternar favorito
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await api.patch<Project>(`/projects/${projectId}/favorite`);
      return response;
    },
    onSuccess: (updatedProject) => {
      // Atualiza a lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Atualiza o cache do projeto específico
      queryClient.setQueryData(['project', updatedProject.id], updatedProject);
    },
  });

  // Mutation para atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      const response = await api.patch<Project>(`/projects/${id}/progress`, { progress });
      return response;
    },
    onSuccess: (updatedProject) => {
      // Atualiza a lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Atualiza o cache do projeto específico
      queryClient.setQueryData(['project', updatedProject.id], updatedProject);
    },
  });

  return {
    // Query
    projects: data?.projects || [],
    pagination: data?.pagination,
    filters: data?.filters,
    isLoading,
    error,
    refetch,

    // Mutations
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutateAsync,

    // Loading states
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
  };
}

// Hook para obter um projeto específico
export function useProject(projectId: number) {
  const queryClient = useQueryClient();

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar o projeto
  const updateProjectMutation = useMutation({
    mutationFn: async (data: UpdateProjectRequest) => {
      const response = await api.put<Project>(`/projects/${projectId}`, data);
      return response;
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['project', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    project,
    isLoading,
    error,
    refetch,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
  };
}

// Hook para estatísticas dos projetos
export function useProjectStats() {
  return useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const response = await api.get<ProjectStats>('/projects/stats');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para projetos favoritos
export function useFavoriteProjects() {
  const queryParams: ListProjectsQuery = {
    favorite: true,
    limit: 6,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };

  return useQuery({
    queryKey: ['favorite-projects'],
    queryFn: async () => {
      const response = await api.get<ListProjectsResponse>('/projects', queryParams);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para projetos recentes
export function useRecentProjects(limit = 5) {
  const queryParams: ListProjectsQuery = {
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  return useQuery({
    queryKey: ['recent-projects', limit],
    queryFn: async () => {
      const response = await api.get<ListProjectsResponse>('/projects', queryParams);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para buscar projetos
export function useSearchProjects(query: string, enabled = true) {
  const queryParams: ListProjectsQuery = {
    search: query,
    limit: 20,
  };

  return useQuery({
    queryKey: ['search-projects', query],
    queryFn: async () => {
      const response = await api.get<ListProjectsResponse>('/projects', queryParams);
      return response;
    },
    enabled: enabled && query.length > 2,
    staleTime: 30 * 1000, // 30 segundos (buscas mudam mais rápido)
  });
}

// Hook utilitário para criar um projeto com callbacks
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      const response = await api.post<Project>('/projects', data);
      return response;
    },
    onSuccess: (newProject) => {
      // Invalida todas as queries de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Adiciona ao cache de projetos recentes
      queryClient.invalidateQueries({ queryKey: ['recent-projects'] });

      // Se for favorito, atualiza cache de favoritos
      if (newProject.isFavorite) {
        queryClient.invalidateQueries({ queryKey: ['favorite-projects'] });
      }
    },
  });
}

// Hook utilitário para excluir projeto com confirmação
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const response = await api.delete(`/projects/${projectId}`);
      return response;
    },
    onSuccess: (_, projectId) => {
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-projects'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-projects'] });

      // Remove do cache específico
      queryClient.removeQueries({ queryKey: ['project', projectId] });
    },
  });
}

export default useProjects;