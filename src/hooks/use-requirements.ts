import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Requirement,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  RequirementType,
  RequirementPriority,
} from '@/types/api';

// Hook para listar requisitos de um projeto
export function useRequirements(projectId: number) {
  const queryClient = useQueryClient();

  const {
    data: requirements = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['requirements', projectId],
    queryFn: async () => {
      const response = await api.get<Requirement[]>(`/projects/${projectId}/requirements`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para criar requisito
  const createRequirementMutation = useMutation({
    mutationFn: async (data: CreateRequirementRequest) => {
      const response = await api.post<Requirement>(`/projects/${projectId}/requirements`, data);
      return response;
    },
    onSuccess: (newRequirement) => {
      // Adiciona ao cache
      queryClient.setQueryData(['requirements', projectId], (old: Requirement[] | undefined) => {
        return old ? [newRequirement, ...old] : [newRequirement];
      });

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['requirement-stats', projectId] });
    },
  });

  // Mutation para atualizar requisito
  const updateRequirementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRequirementRequest }) => {
      const response = await api.put<Requirement>(`/projects/${projectId}/requirements/${id}`, data);
      return response;
    },
    onSuccess: (updatedRequirement) => {
      // Atualiza no cache
      queryClient.setQueryData(['requirements', projectId], (old: Requirement[] | undefined) => {
        return old?.map(req =>
          req.id === updatedRequirement.id ? updatedRequirement : req
        );
      });

      // Atualiza cache do requisito específico
      queryClient.setQueryData(['requirement', updatedRequirement.id], updatedRequirement);

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Mutation para excluir requisito
  const deleteRequirementMutation = useMutation({
    mutationFn: async (requirementId: number) => {
      const response = await api.delete(`/projects/${projectId}/requirements/${requirementId}`);
      return response;
    },
    onSuccess: (_, requirementId) => {
      // Remove do cache
      queryClient.setQueryData(['requirements', projectId], (old: Requirement[] | undefined) => {
        return old?.filter(req => req.id !== requirementId);
      });

      // Remove cache do requisito específico
      queryClient.removeQueries({ queryKey: ['requirement', requirementId] });

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['requirement-stats', projectId] });
    },
  });

  return {
    requirements,
    isLoading,
    error,
    refetch,

    // Mutations
    createRequirement: createRequirementMutation.mutateAsync,
    updateRequirement: updateRequirementMutation.mutateAsync,
    deleteRequirement: deleteRequirementMutation.mutateAsync,

    // Loading states
    isCreating: createRequirementMutation.isPending,
    isUpdating: updateRequirementMutation.isPending,
    isDeleting: deleteRequirementMutation.isPending,
  };
}

// Hook para obter um requisito específico
export function useRequirement(projectId: number, requirementId: number) {
  const queryClient = useQueryClient();

  const {
    data: requirement,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['requirement', requirementId],
    queryFn: async () => {
      const response = await api.get<Requirement>(`/projects/${projectId}/requirements/${requirementId}`);
      return response;
    },
    enabled: !!projectId && !!requirementId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar o requisito
  const updateRequirementMutation = useMutation({
    mutationFn: async (data: UpdateRequirementRequest) => {
      const response = await api.put<Requirement>(`/projects/${projectId}/requirements/${requirementId}`, data);
      return response;
    },
    onSuccess: (updatedRequirement) => {
      queryClient.setQueryData(['requirement', requirementId], updatedRequirement);

      // Atualiza na lista de requisitos
      queryClient.setQueryData(['requirements', projectId], (old: Requirement[] | undefined) => {
        return old?.map(req =>
          req.id === updatedRequirement.id ? updatedRequirement : req
        );
      });

      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return {
    requirement,
    isLoading,
    error,
    refetch,
    updateRequirement: updateRequirementMutation.mutateAsync,
    isUpdating: updateRequirementMutation.isPending,
  };
}

// Hook para estatísticas de requisitos
export function useRequirementStats(projectId: number) {
  return useQuery({
    queryKey: ['requirement-stats', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/requirements/stats`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para requisitos por tipo
export function useRequirementsByType(projectId: number) {
  const { data: allRequirements = [] } = useRequirements(projectId);

  // Filtra localmente por tipo (mais eficiente)
  const requirementsByType = {
    [RequirementType.FUNCIONAL]: allRequirements.filter(req => req.tipo === RequirementType.FUNCIONAL),
    [RequirementType.NAO_FUNCIONAL]: allRequirements.filter(req => req.tipo === RequirementType.NAO_FUNCIONAL),
  };

  return {
    requirementsByType,
    totalRequirements: allRequirements.length,
    functionalRequirements: requirementsByType[RequirementType.FUNCIONAL].length,
    nonFunctionalRequirements: requirementsByType[RequirementType.NAO_FUNCIONAL].length,
  };
}

// Hook para requisitos por prioridade
export function useRequirementsByPriority(projectId: number) {
  const { data: allRequirements = [] } = useRequirements(projectId);

  // Filtra localmente por prioridade (mais eficiente)
  const requirementsByPriority = {
    [RequirementPriority.BAIXA]: allRequirements.filter(req => req.prioridade === RequirementPriority.BAIXA),
    [RequirementPriority.MEDIA]: allRequirements.filter(req => req.prioridade === RequirementPriority.MEDIA),
    [RequirementPriority.ALTA]: allRequirements.filter(req => req.prioridade === RequirementPriority.ALTA),
    [RequirementPriority.CRITICA]: allRequirements.filter(req => req.prioridade === RequirementPriority.CRITICA),
  };

  return {
    requirementsByPriority,
    totalRequirements: allRequirements.length,
    lowPriorityRequirements: requirementsByPriority[RequirementPriority.BAIXA].length,
    mediumPriorityRequirements: requirementsByPriority[RequirementPriority.MEDIA].length,
    highPriorityRequirements: requirementsByPriority[RequirementPriority.ALTA].length,
    criticalPriorityRequirements: requirementsByPriority[RequirementPriority.CRITICA].length,
  };
}

// Hook para requisitos por categoria
export function useRequirementsByCategory(projectId: number) {
  const { data: allRequirements = [] } = useRequirements(projectId);

  // Agrupa por categoria
  const requirementsByCategory = allRequirements.reduce((acc, req) => {
    const category = req.categoria || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(req);
    return acc;
  }, {} as Record<string, Requirement[]>);

  return {
    requirementsByCategory,
    categories: Object.keys(requirementsByCategory),
    totalRequirements: allRequirements.length,
  };
}

// Hook para buscar requisitos
export function useSearchRequirements(projectId: number, query: string) {
  return useQuery({
    queryKey: ['search-requirements', projectId, query],
    queryFn: async () => {
      const response = await api.get<Requirement[]>(`/projects/${projectId}/requirements`, {
        search: query,
        limit: 20,
      });
      return response;
    },
    enabled: !!projectId && query.length > 2,
    staleTime: 30 * 1000, // 30 segundos (buscas mudam mais rápido)
  });
}

// Hook utilitário para criar requisito com callbacks
export function useCreateRequirement(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRequirementRequest) => {
      const response = await api.post<Requirement>(`/projects/${projectId}/requirements`, data);
      return response;
    },
    onSuccess: (newRequirement) => {
      // Invalida todas as queries de requisitos do projeto
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
      queryClient.invalidateQueries({ queryKey: ['requirement-stats', projectId] });

      // Adiciona ao cache do requisito específico
      queryClient.setQueryData(['requirement', newRequirement.id], newRequirement);

      // Invalida cache do projeto (atualiza contadores)
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

// Hook para vincular requisito com tarefa
export function useLinkRequirementToTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requirementId, taskId }: { requirementId: number; taskId: number }) => {
      const response = await api.post(`/requirements/${requirementId}/tasks/${taskId}`);
      return response;
    },
    onSuccess: (_, { requirementId, taskId }) => {
      // Invalida caches relacionados
      queryClient.invalidateQueries({ queryKey: ['requirement', requirementId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

// Hook para desvincular requisito de tarefa
export function useUnlinkRequirementFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requirementId, taskId }: { requirementId: number; taskId: number }) => {
      const response = await api.delete(`/requirements/${requirementId}/tasks/${taskId}`);
      return response;
    },
    onSuccess: (_, { requirementId, taskId }) => {
      // Invalida caches relacionados
      queryClient.invalidateQueries({ queryKey: ['requirement', requirementId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

// Hook para obter tarefas vinculadas a um requisito
export function useRequirementTasks(requirementId: number) {
  return useQuery({
    queryKey: ['requirement-tasks', requirementId],
    queryFn: async () => {
      const response = await api.get(`/requirements/${requirementId}/tasks`);
      return response;
    },
    enabled: !!requirementId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obter requisitos não vinculados a tarefas
export function useUnlinkedRequirements(projectId: number) {
  return useQuery({
    queryKey: ['unlinked-requirements', projectId],
    queryFn: async () => {
      const response = await api.get<Requirement[]>(`/projects/${projectId}/requirements/unlinked`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export default useRequirements;