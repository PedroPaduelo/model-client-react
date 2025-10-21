// Tipos baseados na API Omnity Backend

// =============================================
// USUÁRIO E AUTENTICAÇÃO
// =============================================

export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;          // Nome completo (3-100 caracteres)
  email: string;         // Email válido e único
  password: string;      // Senha forte
  firstName: string;     // Primeiro nome (2-50 caracteres)
  lastName?: string;     // Sobrenome opcional
  dateOfBirth?: string;  // Data de nascimento (YYYY-MM-DD)
}

export interface LoginRequest {
  email: string;    // Email cadastrado
  password: string; // Senha do usuário
}

export interface LoginResponse {
  user: User;
  token: string;        // JWT Access Token
  refreshToken: string; // Refresh Token
  expiresAt: string;    // Data de expiração do token
}

export interface RecoverPasswordRequest {
  email: string;  // Email cadastrado
}

export interface ResetPasswordRequest {
  token: string;         // Token de recuperação
  newPassword: string;   // Nova senha forte
}

// =============================================
// PROJETOS
// =============================================

export enum ProjectStatus {
  ATIVO = 'Ativo',
  PAUSADO = 'Pausado',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado',
  EM_ANDAMENTO = 'Em Andamento',
}

export enum ProjectPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export interface Project {
  id: number;
  name: string;
  description: string;
  stack: string;
  notes?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  isFavorite: boolean;
  metadata?: Record<string, any>;
  gitRepositoryUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastModel?: string;
  userId: string;
  taskCount?: number;
  completedTaskCount?: number;
  requirementCount?: number;
  notificationCount?: number;
}

export interface CreateProjectRequest {
  name: string;                    // Nome do projeto (3-100 chars)
  description: string;             // Descrição detalhada (mínimo 10 chars)
  stack: string;                   // Stack tecnológico
  status?: ProjectStatus;          // Status (default: "Ativo")
  priority?: ProjectPriority;      // Prioridade (default: "Média")
  notes?: string;                  // Notas internas
  metadata?: Record<string, any>;  // Metadados flexíveis
  gitRepositoryUrl?: string;       // URL do repositório Git
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface ListProjectsQuery {
  page?: number;              // Número da página (default: 1)
  limit?: number;             // Itens por página (default: 10, max: 100)
  status?: ProjectStatus;     // Filtro por status
  priority?: ProjectPriority; // Filtro por prioridade
  favorite?: boolean;         // Filtro por favoritos
  search?: string;            // Busca por nome ou descrição
  sortBy?: string;            // Campo de ordenação
  sortOrder?: 'asc' | 'desc'; // Direção da ordenação
}

export interface ListProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    status?: ProjectStatus;
    priority?: ProjectPriority;
    favorite?: boolean;
    search?: string;
  };
}

export interface UpdateProgressRequest {
  progress: number; // Valor entre 0 e 100
}

// =============================================
// TAREFAS
// =============================================

export enum TaskStatus {
  PENDENTE = 'Pendente',
  EM_PROGRESSO = 'Em Progresso',
  BLOQUEADA = 'Bloqueada',
  EM_REVISAO = 'Em Revisão',
  CONCLUIDA = 'Concluída',
}

export interface Task {
  id: number;
  title: string;
  taskDescription: string;
  guidancePrompt: string;
  status: TaskStatus;
  created_by: string;
  updated_by: string;
  additional_information?: string;
  result_task?: string;
  project_id: number;
  createdAt: string;
  updatedAt: string;
  todos?: TaskTodo[];
  requirements?: Requirement[];
}

export interface CreateTaskRequest {
  title: string;
  taskDescription: string;
  guidancePrompt: string;
  additional_information?: string;
  project_id: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  result_task?: string;
}

export interface TaskTodo {
  id: number;
  task_id: number;
  sequence: number;
  item_description: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskTodoRequest {
  task_id: number;
  sequence: number;
  item_description: string;
}

export interface UpdateTaskTodoRequest {
  sequence?: number;
  item_description?: string;
  is_completed?: boolean;
}

// =============================================
// REQUISITOS
// =============================================

export enum RequirementType {
  FUNCIONAL = 'Funcional',
  NAO_FUNCIONAL = 'Não Funcional',
}

export enum RequirementPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export interface Requirement {
  id: number;
  titulo: string;
  descricao: string;
  tipo: RequirementType;
  categoria: string;
  prioridade: RequirementPriority;
  project_id: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface CreateRequirementRequest {
  titulo: string;
  descricao: string;
  tipo: RequirementType;
  categoria: string;
  prioridade: RequirementPriority;
  project_id: number;
}

export interface UpdateRequirementRequest extends Partial<CreateRequirementRequest> {}

// =============================================
// NOTIFICAÇÕES
// =============================================

export enum NotificationPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  URGENTE = 'Urgente',
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  project_id?: number;
  user_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  priority: NotificationPriority;
  project_id?: number;
  user_id?: string;
  metadata?: Record<string, any>;
}

// =============================================
// TAGS
// =============================================

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface ProjectTag {
  id: number;
  projectId: number;
  tagId: number;
  createdAt: string;
}

// =============================================
// WEBSOCKET
// =============================================

export interface WebSocketMessage {
  type: string;
  data: any;
  projectId?: number;
  userId?: string;
  timestamp: string;
}

export interface WebSocketEvent {
  PROJECT_CREATED: 'project_created';
  PROJECT_UPDATED: 'project_updated';
  PROJECT_DELETED: 'project_deleted';
  TASK_CREATED: 'task_created';
  TASK_UPDATED: 'task_updated';
  TASK_DELETED: 'task_deleted';
  REQUIREMENT_CREATED: 'requirement_created';
  REQUIREMENT_UPDATED: 'requirement_updated';
  NOTIFICATION_CREATED: 'notification_created';
}

// =============================================
// PAGINAÇÃO
// =============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================
// ERROS
// =============================================

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// =============================================
// RESPOTAS GENÉRICAS
// =============================================

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  deletedAt: string;
  message: string;
}

export interface ToggleFavoriteResponse {
  project: {
    id: number;
    isFavorite: boolean;
    updatedAt: string;
  };
  message: string;
}

// =============================================
// ESTATÍSTICAS
// =============================================

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  favorite: number;
  averageProgress: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface UserStats {
  totalProjects: number;
  completedTasks: number;
  activeProjects: number;
  totalTasks: number;
  totalRequirements: number;
}

// =============================================
// HISTÓRICO
// =============================================

export interface ProjectHistory {
  id: number;
  projectId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entityType: 'PROJECT';
  entityId: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  userName?: string;
  description: string;
  createdAt: string;
}

// =============================================
// AMBIENTE E CONFIGURAÇÃO
// =============================================

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface WebSocketConfig {
  url: string;
  transports: string[];
  auth?: {
    token: string;
  };
}