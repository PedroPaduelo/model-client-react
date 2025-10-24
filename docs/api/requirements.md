# 📋 API de Requisitos

Sistema completo de gestão de requisitos funcionais e não funcionais com categorização flexível, sistema de prioridades e vinculação completa com tarefas para rastreabilidade.

## 🎯 Visão Geral

A API de requisitos permite o gerenciamento completo do ciclo de vida dos requisitos do projeto, desde a definição inicial até a vinculação com tarefas, acompanhamento de implementação e garantia de rastreabilidade completa entre o que foi planejado e o que foi executado.

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/projects/:projectId/requirements` | Criar requisito no projeto | ✅ Obrigatória |
| `GET` | `/projects/:projectId/requirements` | Listar requisitos do projeto | ✅ Obrigatória |
| `GET` | `/requirements/:id` | Obter detalhes do requisito | ✅ Obrigatória |
| `PUT` | `/requirements/:id` | Atualizar requisito | ✅ Obrigatória |
| `DELETE` | `/requirements/:id` | Excluir requisito | ✅ Obrigatória |
| `POST` | `/requirements/:id/link-to-task` | Vincular requisito à tarefa | ✅ Obrigatória |
| `GET` | `/requirements/:id/tasks` | Listar tarefas vinculadas | ✅ Obrigatória |

## 🔒 Regras de Negócio

### Classificação de Requisitos
- **Funcional**: Comportamentos e features do sistema
- **Não Funcional**: Restrições de qualidade, performance, segurança

### Sistema de Prioridades
- **Baixa**: Nice to have, pode ser postponido
- **Média**: Importante, afeta a usabilidade
- **Alta**: Crítico para o funcionamento principal
- **Crítica**: Impeditivo, bloqueia o projeto

### Multi-Tenancy
- Requisitos pertencem a projetos
- Projetos pertencem a usuários
- Isolamento completo por usuário

## 📝 Detalhes dos Endpoints

### 1. Criar Requisito

**POST** `/projects/:projectId/requirements`

Cria um novo requisito no projeto com classificação completa.

#### Request Body
```typescript
interface CreateRequirementRequest {
  title: string           // Título claro e conciso (5-200 caracteres)
  description: string     // Descrição detalhada (mínimo 20 caracteres)
  type: 'Funcional' | 'Nao Funcional'  // Tipo do requisito
  category?: string       // Categoria para organização
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Crítica'  // Prioridade
}
```

#### Response (201)
```typescript
interface CreateRequirementResponse {
  requirement: {
    id: number
    title: string
    description: string
    type: string
    category?: string
    priority: string
    projectId: number
    createdAt: string
    updatedAt: string
  }
  message: string
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/projects/123/requirements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Autenticação de Usuários",
    "description": "Sistema deve permitir que usuários se cadastrem, façam login com email e senha, recuperem senha e mantenham sessão ativa através de tokens JWT. Deve incluir validação de força de senha e proteção contra ataques de força bruta.",
    "type": "Funcional",
    "category": "Segurança",
    "priority": "Crítica"
  }'
```

### 2. Listar Requisitos do Projeto

**GET** `/projects/:projectId/requirements`

Lista todos os requisitos de um projeto com filtros avançados.

#### Query Parameters
```typescript
interface ListRequirementsQuery {
  page?: number          // Número da página (default: 1)
  limit?: number         // Itens por página (default: 20)
  type?: string          // Filtro por tipo (Funcional/Nao Funcional)
  category?: string      // Filtro por categoria
  priority?: string      // Filtro por prioridade
  search?: string        // Busca por título ou descrição
  hasTasks?: boolean     // Filtro por requisitos com tarefas vinculadas
  sortBy?: string        // Campo de ordenação
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação
}
```

#### Response (200)
```typescript
interface ListRequirementsResponse {
  requirements: Array<{
    id: number
    title: string
    description: string
    type: string
    category?: string
    priority: string
    createdAt: string
    updatedAt: string
    taskCount: number
    completedTaskCount: number
    implementationStatus: 'Not Started' | 'In Progress' | 'Completed'
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
    byType: Record<string, number>
    byPriority: Record<string, number>
    byCategory: Record<string, number>
    implementationRate: number
  }
}
```

#### Exemplo
```bash
curl -X GET "http://localhost:3000/projects/123/requirements?type=Funcional&priority=Crítica&sortBy=priority&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

### 3. Obter Requisito

**GET** `/requirements/:id`

Retorna detalhes completos de um requisito específico incluindo tarefas vinculadas.

#### Response (200)
```typescript
interface GetRequirementResponse {
  requirement: {
    id: number
    title: string
    description: string
    type: string
    category?: string
    priority: string
    projectId: number
    createdAt: string
    updatedAt: string
    project: {
      id: number
      name: string
    }
    requirementTasks: Array<{
      taskId: number
      task: {
        id: number
        title: string
        status: string
        createdBy: string
        createdAt: string
        updatedAt: string
      }
    }>
    statistics: {
      taskCount: number
      completedTaskCount: number
      inProgressTaskCount: number
      pendingTaskCount: number
      implementationPercentage: number
    }
  }
}
```

### 4. Atualizar Requisito

**PUT** `/requirements/:id`

Atualiza dados do requisito mantendo histórico de mudanças.

#### Request Body
```typescript
interface UpdateRequirementRequest {
  title?: string        // Novo título
  description?: string  // Nova descrição
  type?: string         // Novo tipo
  category?: string     // Nova categoria
  priority?: string     // Nova prioridade
}
```

#### Response (200)
```typescript
interface UpdateRequirementResponse {
  requirement: {
    id: number
    title: string
    description: string
    type: string
    category?: string
    priority: string
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

### 5. Excluir Requisito

**DELETE** `/requirements/:id`

Exclui requisito permanentemente (soft delete).

#### Response (200)
```typescript
interface DeleteRequirementResponse {
  success: boolean
  deletedAt: string
  deletedBy: string
  affectedItems: {
    taskLinksDeleted: number
    impactedTasks: number
  }
  message: string
}
```

### 6. Vincular Requisito à Tarefa

**POST** `/requirements/:id/link-to-task`

Vincula um requisito a uma ou mais tarefas existentes.

#### Request Body
```typescript
interface LinkToTaskRequest {
  taskIds: number[]      // IDs das tarefas para vincular
}
```

#### Response (200)
```typescript
interface LinkToTaskResponse {
  requirement: {
    id: number
    title: string
    taskCount: number
  }
  linkedTasks: Array<{
    taskId: number
    taskTitle: string
    linkedAt: string
  }>
  message: string
}
```

### 7. Listar Tarefas Vinculadas

**GET** `/requirements/:id/tasks`

Lista todas as tarefas vinculadas a um requisito específico.

#### Query Parameters
```typescript
interface GetRequirementTasksQuery {
  status?: string        // Filtro por status da tarefa
  sortBy?: string        // Campo de ordenação
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação
}
```

#### Response (200)
```typescript
interface GetRequirementTasksResponse {
  requirement: {
    id: number
    title: string
    type: string
    priority: string
  }
  tasks: Array<{
    id: number
    title: string
    status: string
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
    project: {
      id: number
      name: string
    }
    linkedAt: string
  }>
  statistics: {
    total: number
    byStatus: Record<string, number>
    completionRate: number
  }
}
```

## 📊 Valores Enumerados

### Tipos de Requisito
```typescript
enum RequirementType {
  FUNCIONAL = "Funcional",
  NAO_FUNCIONAL = "Nao Funcional"
}
```

### Prioridades
```typescript
enum RequirementPriority {
  BAIXA = "Baixa",
  MEDIA = "Média",
  ALTA = "Alta",
  CRITICA = "Crítica"
}
```

### Categorias Comuns
```typescript
enum RequirementCategory {
  SEGURANCA = "Segurança",
  PERFORMANCE = "Performance",
  USABILIDADE = "Usabilidade",
  INTEGRACAO = "Integração",
  RELATORIO = "Relatório",
  ADMINISTRACAO = "Administração",
  MOBILE = "Mobile",
  API = "API"
}
```

## 🔍 Validações e Regras

### Validações de Campo
- **title**: obrigatório, 5-200 caracteres
- **description**: obrigatório, mínimo 20 caracteres
- **type**: obrigatório, valor do enum válido
- **priority**: obrigatório, valor do enum válido
- **category**: opcional, máximo 50 caracteres

### Regras de Vinculação
- Tarefa deve pertencer ao mesmo projeto do requisito
- Vinculação N:M permitida
- Histórico de vinculação mantido
- Não permite duplicação

### Regras de Exclusão
- Soft delete mantido para auditoria
- Vinculações com tarefas são removidas
- Histórico preservado
- Impacto em tarefas registrado

## 📈 Índices de Performance

### Índices Otimizados
```sql
-- Índices principais
CREATE INDEX idx_requisitos_project_priority_created ON tbl_requisitos(project_id, priority, created_at);
CREATE INDEX idx_requisitos_project_created ON tbl_requisitos(project_id, created_at);
CREATE INDEX idx_requisitos_type_priority ON tbl_requisitos(type, priority);
CREATE INDEX idx_requisitos_category ON tbl_requisitos(category);

-- Índices de relacionamento
CREATE INDEX idx_requisitos_tasks_requisito_id ON tbl_requisitos_tasks(requisito_id);
CREATE INDEX idx_requisitos_tasks_task_id ON tbl_requisitos_tasks(task_id);
```

### Queries Otimizadas
- Filtros aplicados no nível de banco
- Count queries para estatísticas
- Join queries para relacionamentos
- Paginação eficiente com offset

## 🔄 Relacionamento com Tarefas

### Modelo N:M
```typescript
interface RequirementTask {
  id: number
  taskId: number
  requirementId: number
  createdAt: string
  updatedAt: string
  requirement: Requirement
  task: Task
}
```

### Status de Implementação
- **Not Started**: Nenhuma tarefa vinculada ou iniciada
- **In Progress**: Pelo menos uma tarefa em andamento
- **Completed**: Todas as tarefas vinculadas concluídas

### Métricas de Rastreabilidade
- % de requisitos implementados
- Tempo médio de implementação
- Requisitos críticos não implementados
- Tarefas sem requisito vinculado

## 📊 Estatísticas e Analytics

### Estatísticas por Projeto
```typescript
interface ProjectRequirementStats {
  total: number
  byType: Record<RequirementType, number>
  byPriority: Record<RequirementPriority, number>
  byCategory: Record<string, number>
  implementationRate: number
  criticalNotImplemented: number
  averageImplementationTime: number
}
```

### Dashboard de Requisitos
```typescript
interface RequirementDashboard {
  overview: {
    total: number
    implemented: number
    inProgress: number
    notStarted: number
  }
  byPriority: {
    critical: { total: number; implemented: number }
    high: { total: number; implemented: number }
    medium: { total: number; implemented: number }
    low: { total: number; implemented: number }
  }
  byType: {
    functional: { total: number; implemented: number }
    nonFunctional: { total: number; implemented: number }
  }
  recentActivity: Array<{
    requirementId: number
    title: string
    action: string
    timestamp: string
  }>
}
```

## 🚨 Tratamento de Erros

### Códigos de Erro
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Acesso negado (requisito de outro projeto/usuário)
- `404`: Requisito não encontrado
- `409`: Conflito (tarefa já vinculada)
- `422`: Validação falhou
- `500`: Erro interno

### Exemplos de Respostas de Erro
```json
{
  "error": "Validation failed",
  "details": {
    "title": ["Title must be between 5 and 200 characters"],
    "type": ["Type must be 'Funcional' or 'Nao Funcional'"]
  }
}
```

## 🧪 Testes de API

### Casos de Teste Essenciais
```typescript
describe('Requirements API', () => {
  it('should create functional requirement successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/projects/123/requirements',
      headers: { authorization: `Bearer ${token}` },
      payload: validRequirementData
    })
    expect(response.statusCode).toBe(201)
  })

  it('should link requirement to multiple tasks', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/requirements/456/link-to-task',
      headers: { authorization: `Bearer ${token}` },
      payload: { taskIds: [789, 790, 791] }
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().linkedTasks).toHaveLength(3)
  })
})
```

## 📈 Monitoramento e KPIs

### KPIs Importantes
- Taxa de implementação de requisitos
- Tempo médio de implementação por prioridade
- Requisitos críticos pendentes
- Qualidade da rastreabilidade (tarefas com requisitos)
- Balanceamento entre tipos de requisitos

### Alertas Úteis
- Requisitos críticos sem implementação iniciada
- Muitas tarefas sem requisito vinculado
- Requisitos muito tempo sem atualização
- Desequilíbrio na priorização

---

Esta API oferece um sistema completo e robusto para gestão de requisitos, garantindo rastreabilidade completa entre o planejamento e a execução do projeto.