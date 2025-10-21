import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskTodo,
  CreateTaskTodoRequest,
  UpdateTaskTodoRequest,
} from '@/types/api';
import { TaskStatus } from '@/types/api';

// Hook para listar tarefas de um projeto
export function useTasks(projectId: number) {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para criar tarefa
  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      return response;
    },
    onSuccess: (newTask) => {
      // Adiciona ao cache
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        return old ? [newTask, ...old] : [newTask];
      });

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', projectId] });
    },
  });

  // Mutation para atualizar tarefa
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTaskRequest }) => {
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${id}`, data);
      return response;
    },
    onSuccess: (updatedTask) => {
      // Atualiza no cache
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        return old?.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Atualiza cache da tarefa específica
      queryClient.setQueryData(['task', updatedTask.id], updatedTask);

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', projectId] });
    },
  });

  // Mutation para excluir tarefa
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return response;
    },
    onSuccess: (_, taskId) => {
      // Remove do cache
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        return old?.filter(task => task.id !== taskId);
      });

      // Remove cache da tarefa específica
      queryClient.removeQueries({ queryKey: ['task', taskId] });

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', projectId] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,

    // Mutations
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,

    // Loading states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}

// Hook para obter uma tarefa específica
export function useTask(projectId: number, taskId: number) {
  const queryClient = useQueryClient();

  const {
    data: task,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await api.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
      return response;
    },
    enabled: !!projectId && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar tarefa
  const updateTaskMutation = useMutation({
    mutationFn: async (data: UpdateTaskRequest) => {
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data);
      return response;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['task', taskId], updatedTask);

      // Atualiza na lista de tarefas
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        return old?.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return {
    task,
    isLoading,
    error,
    refetch,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,
  };
}

// Hook para gestão de todos/checklist de tarefas
export function useTaskTodos(projectId: number, taskId: number) {
  const queryClient = useQueryClient();

  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['task-todos', taskId],
    queryFn: async () => {
      const response = await api.get<TaskTodo[]>(`/projects/${projectId}/tasks/${taskId}/todos`);
      return response;
    },
    enabled: !!projectId && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para adicionar todo
  const addTodoMutation = useMutation({
    mutationFn: async (data: CreateTaskTodoRequest) => {
      const response = await api.post<TaskTodo>(`/projects/${projectId}/tasks/${taskId}/todos`, data);
      return response;
    },
    onSuccess: (newTodo) => {
      queryClient.setQueryData(['task-todos', taskId], (old: TaskTodo[] | undefined) => {
        return old ? [...old, newTodo] : [newTodo];
      });
    },
  });

  // Mutation para atualizar todo
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTaskTodoRequest }) => {
      const response = await api.put<TaskTodo>(`/projects/${projectId}/tasks/${taskId}/todos/${id}`, data);
      return response;
    },
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData(['task-todos', taskId], (old: TaskTodo[] | undefined) => {
        return old?.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });

      // Atualiza progresso da tarefa se necessário
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Mutation para excluir todo
  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: number) => {
      const response = await api.delete(`/projects/${projectId}/tasks/${taskId}/todos/${todoId}`);
      return response;
    },
    onSuccess: (_, todoId) => {
      queryClient.setQueryData(['task-todos', taskId], (old: TaskTodo[] | undefined) => {
        return old?.filter(todo => todo.id !== todoId);
      });

      // Atualiza progresso da tarefa se necessário
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  return {
    todos,
    isLoading,
    error,
    refetch,

    // Mutations
    addTodo: addTodoMutation.mutateAsync,
    updateTodo: updateTodoMutation.mutateAsync,
    deleteTodo: deleteTodoMutation.mutateAsync,

    // Loading states
    isAdding: addTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
  };
}

// Hook para estatísticas de tarefas
export function useTaskStats(projectId: number) {
  return useQuery({
    queryKey: ['task-stats', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/tasks/stats`);
      return response;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para tarefas por status
export function useTasksByStatus(projectId: number) {
  const { data: allTasks = [] } = useTasks(projectId);

  // Filtra localmente por status (mais eficiente)
  const tasksByStatus = {
    [TaskStatus.PENDENTE]: allTasks.filter(task => task.status === TaskStatus.PENDENTE),
    [TaskStatus.EM_PROGRESSO]: allTasks.filter(task => task.status === TaskStatus.EM_PROGRESSO),
    [TaskStatus.BLOQUEADA]: allTasks.filter(task => task.status === TaskStatus.BLOQUEADA),
    [TaskStatus.EM_REVISAO]: allTasks.filter(task => task.status === TaskStatus.EM_REVISAO),
    [TaskStatus.CONCLUIDA]: allTasks.filter(task => task.status === TaskStatus.CONCLUIDA),
  };

  return {
    tasksByStatus,
    totalTasks: allTasks.length,
    completedTasks: tasksByStatus[TaskStatus.CONCLUIDA].length,
    inProgressTasks: tasksByStatus[TaskStatus.EM_PROGRESSO].length,
    pendingTasks: tasksByStatus[TaskStatus.PENDENTE].length,
    blockedTasks: tasksByStatus[TaskStatus.BLOQUEADA].length,
    completionRate: allTasks.length > 0 ? (tasksByStatus[TaskStatus.CONCLUIDA].length / allTasks.length) * 100 : 0,
  };
}

// Hook para buscar tarefas
export function useSearchTasks(projectId: number, query: string) {
  return useQuery({
    queryKey: ['search-tasks', projectId, query],
    queryFn: async () => {
      const response = await api.get<Task[]>(`/projects/${projectId}/tasks`, {
        search: query,
        limit: 20,
      });
      return response;
    },
    enabled: !!projectId && query.length > 2,
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook utilitário para criar tarefa com callbacks
export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      return response;
    },
    onSuccess: (newTask) => {
      // Invalida todas as queries de tarefas do projeto
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', projectId] });

      // Adiciona ao cache da tarefa específica
      queryClient.setQueryData(['task', newTask.id], newTask);

      // Invalida cache do projeto (atualiza contadores)
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

// Hook utilitário para atualizar status da tarefa
export function useUpdateTaskStatus(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      const response = await api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, { status });
      return response;
    },
    onSuccess: (updatedTask) => {
      // Atualiza na lista de tarefas
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        return old?.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Atualiza cache da tarefa específica
      queryClient.setQueryData(['task', updatedTask.id], updatedTask);

      // Invalida caches relacionados
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', projectId] });
    },
  });
}

export default useTasks;