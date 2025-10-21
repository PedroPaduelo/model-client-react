# ✅ API de Tarefas

Sistema completo de gestão de tarefas com checklist integrado, vinculação com requisitos, controle de responsáveis e fluxo de status bem definido.

## 🎯 Visão Geral

A API de tarefas permite o gerenciamento detalhado de atividades dentro dos projetos, com recursos avançados como checklist aninhado (TaskTodos), vinculação com requisitos, sistema de atribuição de responsáveis e fluxo de status completo para acompanhamento do progresso.

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/projects/:projectId/tasks` | Criar tarefa no projeto | ✅ Obrigatória |
| `GET` | `/projects/:projectId/tasks` | Listar tarefas do projeto | ✅ Obrigatória |
| `GET` | `/tasks/:id` | Obter detalhes da tarefa | ✅ Obrigatória |
| `PUT` | `/tasks/:id` | Atualizar dados da tarefa | ✅ Obrigatória |
| `PATCH` | `/tasks/:id/status` | Atualizar status da tarefa | ✅ Obrigatória |
| `DELETE` | `/tasks/:id` | Excluir tarefa (soft delete) | ✅ Obrigatória |

## 🔒 Regras de Negócio

### Multi-Tenancy e Hierarquia
- Tarefas pertencem a um projeto específico
- Projetos pertencem a um usuário
- Acesso controlado por userId → projectId → taskId

### Fluxo de Status
- **Pendente**: Tarefa criada, não iniciada
- **Em Progresso**: Tarefa em execução
- **Concluída**: Tarefa finalizada
- **Bloqueada**: Tarefa impedida por dependências
- **Em Revisão**: Aguardando validação

### Soft Delete
- Tarefas são marcadas como excluídas (`deletedAt`)
- TaskTodos associados são excluídos em cascade
- Histórico mantido para auditoria

## 📝 Detalhes dos Endpoints

### 1. Criar Tarefa

**POST** `/projects/:projectId/tasks`

Cria uma nova tarefa no projeto com todos os detalhes necessários.

#### Request Body
```typescript
interface CreateTaskRequest {
  title: string                    // Título da tarefa (3-200 caracteres)
  guidancePrompt: string           // Instruções detalhadas de execução
  description?: string             // Descrição detalhada da tarefa
  additionalInformation?: string   // Informações complementares
  status?: string                  // Status inicial (default: "Pendente")
  requirementIds?: number[]        // IDs dos requisitos vinculados
}
```

#### Response (201)
```typescript
interface CreateTaskResponse {
  task: {
    id: number
    title: string
    guidancePrompt: string
    description?: string
    additionalInformation?: string
    status: string
    createdBy: string
    updatedBy: string
    projectId: number
    createdAt: string
    updatedAt: string
    requirementTasks: Array<{
      requirementId: number
      requirement: {
        id: number
        title: string
        type: string
      }
    }>
  }
  message: string
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/projects/123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Implementar Autenticação JWT",
    "guidancePrompt": "Criar sistema completo de autenticação JWT com refresh tokens. Implementar middleware de verificação, endpoints de login/logout e gestão de tokens.",
    "description": "Implementar módulo de autenticação seguro com JWT",
    "additionalInformation": "Usar biblioteca jsonwebtoken, implementar rate limiting, seguir padrões de segurança OWASP",
    "status": "Pendente",
    "requirementIds": [45, 67]
  }'
```

### 2. Listar Tarefas do Projeto

**GET** `/projects/:projectId/tasks`

Lista todas as tarefas de um projeto com filtros e paginação.

#### Query Parameters
```typescript
interface ListTasksQuery {
  page?: number          // Número da página (default: 1)
  limit?: number         // Itens por página (default: 20)
  status?: string        // Filtro por status
  createdBy?: string     // Filtro por criador
  updatedBy?: string     // Filtro por atualizador
  search?: string        // Busca por título ou descrição
  sortBy?: string        // Campo de ordenação
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação
  includeTodos?: boolean // Incluir checklist na resposta
}
```

#### Response (200)
```typescript
interface ListTasksResponse {
  tasks: Array<{
    id: number
    title: string
    status: string
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
    todoCount: number
    completedTodoCount: number
    requirementCount: number
    progress?: number
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  statistics: {
    total: number
    byStatus: Record<string, number>
    completionRate: number
  }
}
```

#### Exemplo
```bash
curl -X GET "http://localhost:3000/projects/123/tasks?status=Pendente&sortBy=createdAt&sortOrder=desc&includeTodos=true" \
  -H "Authorization: Bearer <token>"
```

### 3. Obter Tarefa

**GET** `/tasks/:id`

Retorna detalhes completos de uma tarefa específica incluindo checklist.

#### Response (200)
```typescript
interface GetTaskResponse {
  task: {
    id: number
    title: string
    guidancePrompt: string
    description?: string
    additionalInformation?: string
    status: string
    createdBy: string
    updatedBy: string
    projectId: number
    result?: string
    createdAt: string
    updatedAt: string
    project: {
      id: number
      name: string
    }
    taskTodos: Array<{
      id: number
      description: string
      isCompleted: boolean
      sequence: number
      createdAt: string
      updatedAt: string
    }>
    requirementTasks: Array<{
      requirementId: number
      requirement: {
        id: number
        title: string
        description: string
        type: string
        priority: string
      }
    }>
    progress: {
      todoPercentage: number
      isCompleted: boolean
    }
  }
}
```

### 4. Atualizar Tarefa

**PUT** `/tasks/:id`

Atualiza dados da tarefa mantendo controle de responsáveis.

#### Request Body
```typescript
interface UpdateTaskRequest {
  title?: string                   // Novo título
  guidancePrompt?: string          // Novas instruções
  description?: string             // Nova descrição
  additionalInformation?: string   // Novas informações
  status?: string                  // Novo status
  result?: string                  // Resultado da tarefa
  requirementIds?: number[]        // Requisitos vinculados
}
```

#### Response (200)
```typescript
interface UpdateTaskResponse {
  task: {
    id: number
    title: string
    guidancePrompt: string
    status: string
    updatedBy: string
    updatedAt: string
  }
  changes: {
    oldValues: object
    newValues: object
    changedBy: string
    changedAt: string
  }
  message: string
}
```

### 5. Atualizar Status

**PATCH** `/tasks/:id/status`

Atualiza apenas o status da tarefa com regras de transição.

#### Request Body
```typescript
interface UpdateStatusRequest {
  status: 'Pendente' | 'Em Progresso' | 'Concluída' | 'Bloqueada' | 'Em Revisão'
  reason?: string        // Motivo da mudança (opcional)
}
```

#### Response (200)
```typescript
interface UpdateStatusResponse {
  task: {
    id: number
    status: string
    updatedBy: string
    updatedAt: string
  }
  previousStatus: string
  transitionLog: {
    from: string
    to: string
    changedBy: string
    changedAt: string
    reason?: string
  }
  message: string
}
```

### 6. Excluir Tarefa

**DELETE** `/tasks/:id`

Exclui tarefa permanentemente (soft delete).

#### Response (200)
```typescript
interface DeleteTaskResponse {
  success: boolean
  deletedAt: string
  deletedBy: string
  affectedItems: {
    todosDeleted: number
    requirementLinksDeleted: number
  }
  message: string
}
```

## 📝 Sub-API de Checklist (TaskTodos)

### Endpoints de TaskTodos
```typescript
GET    /tasks/:taskId/todos        // Listar checklist items
POST   /tasks/:taskId/todos        // Criar item no checklist
GET    /tasks/todos/:id            // Obter item específico
PATCH  /tasks/todos/:id            // Atualizar item
DELETE /tasks/todos/:id            // Excluir item
PATCH  /tasks/todos/:id/complete   // Marcar como concluído
```

### Criar Item no Checklist
**POST** `/tasks/:taskId/todos`

#### Request Body
```typescript
interface CreateTodoRequest {
  description: string    // Descrição do item
  sequence?: number      // Ordem (default: last + 1)
}
```

#### Response (201)
```typescript
interface CreateTodoResponse {
  todo: {
    id: number
    description: string
    isCompleted: boolean
    sequence: number
    taskId: number
    createdAt: string
  }
  message: string
}
```

### Atualizar Item do Checklist
**PATCH** `/tasks/todos/:id`

#### Request Body
```typescript
interface UpdateTodoRequest {
  description?: string
  isCompleted?: boolean
  sequence?: number
}
```

## 📊 Valores Enumerados

### Status da Tarefa
```typescript
enum TaskStatus {
  PENDENTE = "Pendente",
  EM_PROGRESSO = "Em Progresso",
  CONCLUIDA = "Concluída",
  BLOQUEADA = "Bloqueada",
  EM_REVISAO = "Em Revisão"
}
```

### Estados do Todo
```typescript
enum TodoState {
  PENDING = false,
  COMPLETED = true
}
```

## 🔍 Validações e Regras

### Validações de Campo
- **title**: obrigatório, 3-200 caracteres
- **guidancePrompt**: obrigatório, mínimo 20 caracteres
- **status**: deve ser um valor válido do enum
- **sequence**: número positivo, único por tarefa
- **requirementIds**: devem existir e pertencer ao mesmo projeto

### Regras de Transição de Status
- **Pendente → Em Progresso**: Sempre permitido
- **Em Progresso → Concluída**: Apenas se todos os todos concluídos
- **Concluída → Em Revisão**: Para validação
- **Qualquer → Bloqueada**: Quando há impedimentos
- **Bloqueada → Em Progresso**: Quando impedimento resolvido

### Regras de Checklist
- Sequence único por tarefa
- Auto-reorganização ao excluir/mover
- Progresso calculado automaticamente
- Exclusão em cascade com tarefa

## 📈 Índices de Performance

### Índices Otimizados
```sql
-- Índices principais
CREATE INDEX idx_tasks_project_status_created ON tbl_tasks(project_id, status, created_at);
CREATE INDEX idx_tasks_status_created ON tbl_tasks(status, created_at);
CREATE INDEX idx_tasks_project_id_created ON tbl_tasks(project_id, created_at);
CREATE INDEX idx_tasks_created_by_created ON tbl_tasks(created_by, created_at);

-- Índices de TaskTodos
CREATE INDEX idx_task_todos_task_id ON tbl_task_todos(task_id);
CREATE INDEX idx_task_todos_completed ON tbl_task_todos(is_completed);
CREATE INDEX idx_task_todos_sequence ON tbl_task_todos(sequence);
```

### Queries Otimizadas
- Filtros aplicados no nível de banco
- Count queries para estatísticas
- Join queries para relacionamentos
- Paginação eficiente

## 🔄 Integração com Requisitos

### Vinculação N:M
```typescript
interface RequirementTask {
  id: number
  taskId: number
  requirementId: number
  createdAt: string
  updatedAt: string
  requirement: {
    id: number
    title: string
    type: string
    priority: string
  }
}
```

### Regras de Vinculação
- Requisito deve pertencer ao mesmo projeto
- Múltiplos requisitos por tarefa
- Múltiplas tarefas por requisito
- Histórico de vinculação mantido

## 📊 Estatísticas e Progresso

### Cálculo de Progresso
```typescript
interface TaskProgress {
  todoCount: number
  completedTodoCount: number
  todoPercentage: number
  isCompleted: boolean
  status: TaskStatus
}
```

### Estatísticas por Projeto
```typescript
interface ProjectTaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  completionRate: number
  averageCompletionTime: number
  overdueTasks: number
  blockedTasks: number
}
```

## 🚨 Tratamento de Erros

### Códigos de Erro
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Acesso negado (tarefa de outro projeto/usuário)
- `404`: Tarefa não encontrada
- `409`: Conflito (transição de status inválida)
- `422`: Validação falhou
- `500`: Erro interno

### Exemplos de Respostas de Erro
```json
{
  "error": "Status transition not allowed",
  "details": {
    "from": "Concluída",
    "to": "Pendente",
    "reason": "Cannot move from completed to pending"
  }
}
```

## 🧪 Testes de API

### Casos de Teste Essenciais
```typescript
describe('Tasks API', () => {
  it('should create task with todos successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/projects/123/tasks',
      headers: { authorization: `Bearer ${token}` },
      payload: validTaskData
    })
    expect(response.statusCode).toBe(201)
  })

  it('should validate status transitions', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/456/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'InvalidStatus' }
    })
    expect(response.statusCode).toBe(422)
  })
})
```

## 📈 Monitoramento e Analytics

### KPIs Importantes
- Tempo médio de conclusão de tarefas
- Taxa de conclusão por projeto
- Tarefas bloqueadas por tempo
- Utilização de checklist
- Transições de status

### Alertas Úteis
- Tarefas muito tempo em "Em Progresso"
- Múltiplas tarefas bloqueadas
- Checklists sem progresso
- Tarefas sem atualização recente

---

Esta API fornece um sistema completo e robusto para gestão de tarefas, com todas as funcionalidades necessárias para controle detalhado do progresso e colaboração eficiente.