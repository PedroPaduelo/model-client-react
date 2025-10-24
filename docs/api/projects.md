# 📊 API de Projetos

Sistema completo de gerenciamento de projetos com metadados flexíveis, sistema de favoritos, histórico completo e multi-tenancy.

## 🎯 Visão Geral

A API de projetos permite o gerenciamento completo do ciclo de vida dos projetos, desde a criação até o acompanhamento de progresso, com recursos avançados como tags personalizadas, histórico de mudanças e integração com tarefas e requisitos.

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/projects` | Criar novo projeto | ✅ Obrigatória |
| `GET` | `/projects` | Listar projetos do usuário | ✅ Obrigatória |
| `GET` | `/projects/:id` | Obter detalhes do projeto | ✅ Obrigatória |
| `PUT` | `/projects/:id` | Atualizar projeto | ✅ Obrigatória |
| `DELETE` | `/projects/:id` | Excluir projeto (soft delete) | ✅ Obrigatória |
| `PATCH` | `/projects/:id/progress` | Atualizar progresso | ✅ Obrigatória |
| `PATCH` | `/projects/:id/favorite` | Alternar favorito | ✅ Obrigatória |

## 🔒 Regras de Negócio

### Multi-Tenancy
- Todos os projetos pertencem a um usuário (`userId`)
- Acesso isolado por usuário
- Queries sempre filtram por userId

### Validações
- Nome: obrigatório, 3-100 caracteres
- Descrição: obrigatória, mínimo 10 caracteres
- Stack: obrigatória, tecnologias separadas por vírgula
- Status: valores pré-definidos
- Priority: valores pré-definidos
- Progress: número entre 0-100

### Soft Delete
- Projetos são marcados como excluídos (`deletedAt`)
- Dados mantidos para auditoria e recuperação
- Não aparecem em listagens normais

## 📝 Detalhes dos Endpoints

### 1. Criar Projeto

**POST** `/projects`

Cria um novo projeto com metadados completos.

#### Request Body
```typescript
interface CreateProjectRequest {
  name: string                    // Nome do projeto (3-100 chars)
  description: string             // Descrição detalhada (mínimo 10 chars)
  stack: string                   // Stack tecnológico (ex: "Node.js, React, PostgreSQL")
  status?: string                 // Status (default: "Ativo")
  priority?: string               // Prioridade (default: "Média")
  notes?: string                  // Notas internas
  metadata?: object               // Metadados flexíveis (JSON)
  gitRepositoryUrl?: string       // URL do repositório Git
}
```

#### Response (201)
```typescript
interface CreateProjectResponse {
  project: {
    id: number
    name: string
    description: string
    stack: string
    status: string
    priority: string
    progress: number
    isFavorite: boolean
    metadata?: object
    gitRepositoryUrl?: string
    createdAt: string
    updatedAt: string
    userId: string
  }
  message: string
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "E-commerce Platform",
    "description": "Plataforma completa de e-commerce com gestão de produtos, pedidos e pagamentos",
    "stack": "Node.js, React, PostgreSQL, Stripe, Redis",
    "status": "Ativo",
    "priority": "Alta",
    "gitRepositoryUrl": "https://github.com/user/ecommerce-platform"
  }'
```

### 2. Listar Projetos

**GET** `/projects`

Lista todos os projetos do usuário com filtros e paginação.

#### Query Parameters
```typescript
interface ListProjectsQuery {
  page?: number         // Número da página (default: 1)
  limit?: number        // Itens por página (default: 10, max: 100)
  status?: string       // Filtro por status
  priority?: string     // Filtro por prioridade
  favorite?: boolean    // Filtro por favoritos
  search?: string       // Busca por nome ou descrição
  sortBy?: string       // Campo de ordenação (createdAt, updatedAt, name)
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação (default: desc)
}
```

#### Response (200)
```typescript
interface ListProjectsResponse {
  projects: Array<{
    id: number
    name: string
    description: string
    stack: string
    status: string
    priority: string
    progress: number
    isFavorite: boolean
    createdAt: string
    updatedAt: string
    taskCount?: number
    completedTaskCount?: number
    requirementCount?: number
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    status?: string
    priority?: string
    favorite?: boolean
    search?: string
  }
}
```

#### Exemplo
```bash
curl -X GET "http://localhost:3000/projects?page=1&limit=10&status=Ativo&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

### 3. Obter Projeto

**GET** `/projects/:id`

Retorna detalhes completos de um projeto específico.

#### Response (200)
```typescript
interface GetProjectResponse {
  project: {
    id: number
    name: string
    description: string
    stack: string
    notes?: string
    status: string
    priority: string
    progress: number
    isFavorite: boolean
    metadata?: object
    gitRepositoryUrl?: string
    createdAt: string
    updatedAt: string
    lastModel?: string
    userId: string
    statistics: {
      taskCount: number
      completedTaskCount: number
      requirementCount: number
      notificationCount: number
    }
    tags: Array<{
      id: number
      name: string
      color?: string
    }>
  }
}
```

#### Exemplo
```bash
curl -X GET http://localhost:3000/projects/123 \
  -H "Authorization: Bearer <token>"
```

### 4. Atualizar Projeto

**PUT** `/projects/:id`

Atualiza dados do projeto mantendo histórico das mudanças.

#### Request Body
```typescript
interface UpdateProjectRequest {
  name?: string           // Nome do projeto
  description?: string    // Descrição detalhada
  stack?: string          // Stack tecnológico
  status?: string         // Status
  priority?: string       // Prioridade
  notes?: string          // Notas internas
  metadata?: object       // Metadados flexíveis
  gitRepositoryUrl?: string  // URL do repositório
}
```

#### Response (200)
```typescript
interface UpdateProjectResponse {
  project: {
    id: number
    name: string
    description: string
    stack: string
    status: string
    priority: string
    progress: number
    isFavorite: boolean
    metadata?: object
    gitRepositoryUrl?: string
    updatedAt: string
  }
  changes: {
    oldValues: object
    newValues: object
    changedAt: string
  }
  message: string
}
```

### 5. Excluir Projeto

**DELETE** `/projects/:id`

Exclui projeto permanentemente (soft delete).

#### Response (200)
```typescript
interface DeleteProjectResponse {
  success: boolean
  deletedAt: string
  message: string
}
```

#### Exemplo
```bash
curl -X DELETE http://localhost:3000/projects/123 \
  -H "Authorization: Bearer <token>"
```

### 6. Atualizar Progresso

**PATCH** `/projects/:id/progress`

Atualiza o progresso do projeto (0-100).

#### Request Body
```typescript
interface UpdateProgressRequest {
  progress: number  // Valor entre 0 e 100
}
```

#### Response (200)
```typescript
interface UpdateProgressResponse {
  project: {
    id: number
    progress: number
    updatedAt: string
  }
  previousProgress: number
  message: string
}
```

### 7. Alternar Favorito

**PATCH** `/projects/:id/favorite`

Adiciona ou remove projeto dos favoritos.

#### Response (200)
```typescript
interface ToggleFavoriteResponse {
  project: {
    id: number
    isFavorite: boolean
    updatedAt: string
  }
  message: string
}
```

## 📊 Valores Enumerados

### Status
```typescript
enum ProjectStatus {
  ATIVO = "Ativo",
  PAUSADO = "Pausado",
  CONCLUIDO = "Concluído",
  CANCELADO = "Cancelado",
  EM_ANDAMENTO = "Em Andamento"
}
```

### Prioridade
```typescript
enum ProjectPriority {
  BAIXA = "Baixa",
  MEDIA = "Média",
  ALTA = "Alta",
  CRITICA = "Crítica"
}
```

## 🔍 Validações e Regras

### Validações de Campo
- **name**: obrigatório, 3-100 caracteres, único por usuário
- **description**: obrigatório, mínimo 10 caracteres
- **stack**: obrigatório, formato "Tecnologia1, Tecnologia2"
- **status**: deve ser um valor válido do enum
- **priority**: deve ser um valor válido do enum
- **progress**: número entre 0 e 100

### Regras de Negócio
- Projetos favoritos aparecem primeiro em listagens
- Progresso não pode ser negativo ou maior que 100
- Soft delete mantém dados para auditoria
- Histórico registrado para toda mudança

## 📈 Índices de Performance

### Índices no Database
```sql
-- Índices para performance
CREATE INDEX idx_project_created_at ON tbl_project(created_at);
CREATE INDEX idx_project_status ON tbl_project(status);
CREATE INDEX idx_project_user_created ON tbl_project(user_id, created_at);
CREATE INDEX idx_project_favorite ON tbl_project(is_favorite);
CREATE INDEX idx_project_progress ON tbl_project(progress);
```

### Queries Otimizadas
- Listagens sempre ordenadas e paginadas
- Filtros aplicados no nível de banco
- Count queries otimizadas para estatísticas
- Join queries para relacionamentos

## 🔄 Histórico de Mudanças

Toda alteração em projeto é registrada em `tbl_project_history`:

```typescript
interface ProjectHistory {
  id: number
  projectId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'
  entityType: 'PROJECT'
  entityId: number
  oldValues?: object
  newValues?: object
  userId: string
  userName?: string
  description: string
  createdAt: string
}
```

## 🏷️ Integração com Tags

Projetos podem ser associados a tags personalizadas:

```typescript
interface ProjectTag {
  id: number
  projectId: number
  tagId: number
  createdAt: string
}
```

## 📊 Estatísticas e Métricas

### Métricas Disponíveis
- Quantidade total de projetos
- Projetos por status
- Projetos por prioridade
- Progresso médio
- Projetos favoritos
- Taxa de conclusão

### Dashboard Stats
```typescript
interface ProjectStats {
  total: number
  active: number
  completed: number
  favorite: number
  averageProgress: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
}
```

## 🚨 Tratamento de Erros

### Códigos de Erro
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Acesso negado (projeto de outro usuário)
- `404`: Projeto não encontrado
- `409`: Conflito (nome duplicado)
- `422`: Validação falhou
- `500`: Erro interno

### Exemplos de Respostas de Erro
```json
{
  "error": "Validation failed",
  "details": {
    "name": ["Name is required"],
    "progress": ["Progress must be between 0 and 100"]
  }
}
```

## 🧪 Testes de API

### Exemplos de Casos de Teste
```typescript
describe('Projects API', () => {
  it('should create project successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: validProjectData
    })
    expect(response.statusCode).toBe(201)
  })

  it('should not access another user project', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/projects/999',
      headers: { authorization: `Bearer ${token}` }
    })
    expect(response.statusCode).toBe(404)
  })
})
```

## 📈 Monitoramento e Analytics

### KPIs Importantes
- Tempo médio de criação de projetos
- Taxa de conclusão de projetos
- Projetos criados por mês
- Uso de tags
- Engajamento (favoritos, atualizações)

### Alertas
- Projetos sem atividade por 30 dias
- Múltiplas tentativas de acesso não autorizado
- Erros inesperados na API

---

Esta API oferece uma gestão completa e segura de projetos, com todas as funcionalidades necessárias para um controle eficiente do ciclo de vida dos projetos.