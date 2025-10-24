# 🔔 API de Notificações

Sistema completo de notificações inteligente por usuário e projeto, com prioridades configuráveis, metadados flexíveis e escopo global ou por projeto específico.

## 🎯 Visão Geral

A API de notificações gerencia o envio e controle de mensagens para usuários, suportando notificações globais do sistema, específicas de projetos, com diferentes prioridades e metadados flexíveis para contextualização completa.

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/notifications` | Listar notificações do usuário | ✅ Obrigatória |
| `GET` | `/notifications/:id` | Obter detalhes da notificação | ✅ Obrigatória |
| `PATCH` | `/notifications/:id/read` | Marcar como lida | ✅ Obrigatória |
| `PATCH` | `/notifications/:id/unread` | Marcar como não lida | ✅ Obrigatória |
| `DELETE` | `/notifications/:id` | Excluir notificação | ✅ Obrigatória |
| `PATCH` | `/notifications/read-all` | Marcar todas como lidas | ✅ Obrigatória |
| `DELETE` | `/notifications/clear-all` | Limpar todas as notificações | ✅ Obrigatória |

## 🔒 Regras de Negócio

### Escopo de Notificações
- **Global**: Notificações do sistema para todos os usuários
- **Projeto**: Notificações específicas de um projeto
- **Pessoal**: Notificações individuais do usuário

### Sistema de Prioridades
- **Baixa**: Informações gerais, atualizações de sistema
- **Média**: Ações importantes do usuário, atualizações de projetos
- **Alta**: Alterações críticas, atribuições importantes
- **Crítica**: Alertas de segurança, falhas críticas

### Controle de Leitura
- Status de leitura individual por notificação
- Timestamp de leitura (`readAt`)
- Filtros por notificações lidas/não lidas
- Batch operations para marcação em lote

## 📝 Detalhes dos Endpoints

### 1. Listar Notificações

**GET** `/notifications`

Lista todas as notificações do usuário com filtros avançados.

#### Query Parameters
```typescript
interface ListNotificationsQuery {
  page?: number          // Número da página (default: 1)
  limit?: number         // Itens por página (default: 20)
  isRead?: boolean       // Filtro por status de leitura
  type?: string          // Filtro por tipo de notificação
  priority?: string      // Filtro por prioridade
  projectId?: number     // Filtro por projeto específico
  startDate?: string     // Data inicial (YYYY-MM-DD)
  endDate?: string       // Data final (YYYY-MM-DD)
  search?: string        // Busca por título ou mensagem
  sortBy?: string        // Campo de ordenação
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação
}
```

#### Response (200)
```typescript
interface ListNotificationsResponse {
  notifications: Array<{
    id: number
    type: string
    title: string
    message: string
    priority: string
    isRead: boolean
    readAt?: string
    metadata?: object
    projectId?: number
    project?: {
      id: number
      name: string
    }
    createdAt: string
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
    unread: number
    byPriority: Record<string, number>
    byType: Record<string, number>
  }
}
```

#### Exemplo
```bash
curl -X GET "http://localhost:3000/notifications?isRead=false&priority=Crítica&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <token>"
```

### 2. Obter Notificação

**GET** `/notifications/:id`

Retorna detalhes completos de uma notificação específica.

#### Response (200)
```typescript
interface GetNotificationResponse {
  notification: {
    id: number
    type: string
    title: string
    message: string
    priority: string
    isRead: boolean
    readAt?: string
    metadata?: object
    projectId?: number
    userId: string
    createdAt: string
    project?: {
      id: number
      name: string
      description?: string
    }
    context?: {
      actionUrl?: string
      actionText?: string
      relatedEntity?: {
        type: string
        id: number
        name: string
      }
    }
  }
}
```

### 3. Marcar como Lida

**PATCH** `/notifications/:id/read`

Marca uma notificação específica como lida.

#### Response (200)
```typescript
interface MarkAsReadResponse {
  notification: {
    id: number
    isRead: boolean
    readAt: string
  }
  message: string
}
```

### 4. Marcar como Não Lida

**PATCH** `/notifications/:id/unread`

Marca uma notificação como não lida (limpa o readAt).

#### Response (200)
```typescript
interface MarkAsUnreadResponse {
  notification: {
    id: number
    isRead: boolean
    readAt: null
  }
  message: string
}
```

### 5. Excluir Notificação

**DELETE** `/notifications/:id`

Exclui permanentemente uma notificação.

#### Response (200)
```typescript
interface DeleteNotificationResponse {
  success: boolean
  deletedAt: string
  message: string
}
```

### 6. Marcar Todas como Lidas

**PATCH** `/notifications/read-all`

Marca todas as notificações não lidas do usuário como lidas.

#### Request Body (opcional)
```typescript
interface ReadAllRequest {
  filters?: {
    projectId?: number    // Apenas de um projeto específico
    priority?: string     // Apenas de uma prioridade específica
    type?: string         // Apenas de um tipo específico
  }
}
```

#### Response (200)
```typescript
interface ReadAllResponse {
  markedCount: number
  notifications: Array<{
    id: number
    readAt: string
  }>
  message: string
}
```

### 7. Limpar Todas as Notificações

**DELETE** `/notifications/clear-all`

Exclui todas as notificações do usuário (com opção de filtros).

#### Request Body (opcional)
```typescript
interface ClearAllRequest {
  filters?: {
    isRead?: boolean      // Apenas lidas ou não lidas
    projectId?: number    // Apenas de um projeto
    olderThan?: string    // Mais antigas que (YYYY-MM-DD)
  }
}
```

#### Response (200)
```typescript
interface ClearAllResponse {
  deletedCount: number
  message: string
}
```

## 📊 Tipos de Notificação

### Tipos Predefinidos
```typescript
enum NotificationType {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_COMPLETED = "PROJECT_COMPLETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_OVERDUE = "TASK_OVERDUE",
  REQUIREMENT_ADDED = "REQUIREMENT_ADDED",
  REQUIREMENT_UPDATED = "REQUIREMENT_UPDATED",
  COMMENT_ADDED = "COMMENT_ADDED",
  MENTION = "MENTION",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
  SECURITY_ALERT = "SECURITY_ALERT",
  DEADLINE_REMINDER = "DEADLINE_REMINDER"
}
```

### Templates de Mensagem
```typescript
interface NotificationTemplates {
  [key: string]: {
    title: string
    message: string
    priority: RequirementPriority
    actionUrl?: string
    actionText?: string
  }
}

const templates: NotificationTemplates = {
  PROJECT_CREATED: {
    title: "Novo Projeto Criado",
    message: "O projeto '{projectName}' foi criado com sucesso!",
    priority: "Média",
    actionUrl: "/projects/{projectId}",
    actionText: "Ver Projeto"
  },
  TASK_ASSIGNED: {
    title: "Nova Tarefa Atribuída",
    message: "Você foi atribuído à tarefa '{taskTitle}' no projeto '{projectName}'.",
    priority: "Alta",
    actionUrl: "/projects/{projectId}/tasks/{taskId}",
    actionText: "Ver Tarefa"
  },
  // ... outros templates
}
```

## 🔍 Validações e Regras

### Validações de Campo
- **title**: obrigatório, máximo 200 caracteres
- **message**: obrigatório, máximo 2000 caracteres
- **type**: obrigatório, valor do enum válido
- **priority**: obrigatório, valor do enum válido
- **projectId**: opcional, deve pertencer ao usuário

### Regras de Acesso
- Usuários só veem notificações próprias
- Projetos validados contra userId
- Soft delete para auditoria
- Rate limiting para criação

### Regras de Leitura
- readAt registrado na primeira leitura
- Marcação em lote para eficiência
- Filtros complexos suportados
- Estatísticas em tempo real

## 📈 Índices de Performance

### Índices Otimizados
```sql
-- Índices principais
CREATE INDEX idx_notification_user_read_created ON tbl_notification(user_id, is_read, created_at);
CREATE INDEX idx_notification_user_priority_created ON tbl_notification(user_id, priority, created_at);
CREATE INDEX idx_notification_project_created ON tbl_notification(project_id, created_at);
CREATE INDEX idx_notification_type_priority_created ON tbl_notification(type, priority, created_at);

-- Índices de filtros
CREATE INDEX idx_notification_user_id ON tbl_notification(user_id);
CREATE INDEX idx_notification_project_id ON tbl_notification(project_id);
CREATE INDEX idx_notification_is_read ON tbl_notification(is_read);
CREATE INDEX idx_notification_type ON tbl_notification(type);
CREATE INDEX idx_notification_priority ON tbl_notification(priority);
CREATE INDEX idx_notification_created_at ON tbl_notification(created_at);
```

### Queries Otimizadas
- Filtros compostos eficientes
- Count queries para estatísticas
- Paginação com cursor
- Batch operations otimizadas

## 🔧 Sistema de Envio de Notificações

### Serviço de Notificação
```typescript
class NotificationService {
  async send(params: {
    userId: string
    type: NotificationType
    title: string
    message: string
    priority: RequirementPriority
    projectId?: number
    metadata?: object
  }): Promise<Notification>

  async broadcast(params: {
    type: NotificationType
    title: string
    message: string
    priority: RequirementPriority
    metadata?: object
  }): Promise<void>

  async sendToProjectMembers(params: {
    projectId: number
    type: NotificationType
    title: string
    message: string
    priority: RequirementPriority
    metadata?: object
  }): Promise<void>
}
```

### Gatilhos Automáticos
- Criação/Atualização de projetos
- Mudanças de status de tarefas
- Atribuições de responsáveis
- Comentários e menções
- Alertas de segurança
- Lembretes de deadline

## 📊 Estatísticas e Analytics

### Estatísticas por Usuário
```typescript
interface UserNotificationStats {
  total: number
  unread: number
  byPriority: Record<RequirementPriority, number>
  byType: Record<string, number>
  averageReadTime: number
  engagementRate: number
}
```

### Estatísticas do Sistema
```typescript
interface SystemNotificationStats {
  totalSent: number
  totalRead: number
  averageReadTime: number
  mostCommonTypes: Array<{
    type: string
    count: number
  }>
  priorityDistribution: Record<RequirementPriority, number>
  engagementByPriority: Record<RequirementPriority, number>
}
```

## 🔄 Integração com WebSocket

### Eventos em Tempo Real
```typescript
// Eventos WebSocket para notificações
interface NotificationEvents {
  'notification:created': (notification: Notification) => void
  'notification:read': (notificationId: number, userId: string) => void
  'notification:deleted': (notificationId: number, userId: string) => void
  'notifications:read-all': (userId: string, count: number) => void
}
```

### Salas de WebSocket
- `user:{userId}` - Notificações pessoais
- `project:{projectId}` - Notificações do projeto
- `notifications` - Broadcast do sistema

## 🚨 Tratamento de Erros

### Códigos de Erro
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Acesso negado (notificação de outro usuário)
- `404`: Notificação não encontrada
- `422`: Validação falhou
- `429**: Muitas tentativas (rate limit)
- `500`: Erro interno

### Exemplos de Respostas de Erro
```json
{
  "error": "Notification not found",
  "details": {
    "notificationId": 12345,
    "userId": "user_123"
  }
}
```

## 🧪 Testes de API

### Casos de Teste Essenciais
```typescript
describe('Notifications API', () => {
  it('should list user notifications with filters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notifications?isRead=false&priority=Alta',
      headers: { authorization: `Bearer ${token}` }
    })
    expect(response.statusCode).toBe(200)
  })

  it('should mark notification as read', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/notifications/123/read',
      headers: { authorization: `Bearer ${token}` }
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().notification.isRead).toBe(true)
  })
})
```

## 📈 Monitoramento e KPIs

### KPIs Importantes
- Taxa de leitura de notificações
- Tempo médio para leitura
- Engajamento por prioridade
- Notificações não lidas por tempo
- Tipos mais efetivos

### Alertas Úteis
- Acúmulo de notificações não lidas
- Taxa de leitura muito baixa
- Notificações críticas não lidas
- Problemas no sistema de envio

---

Esta API oferece um sistema completo e inteligente de notificações, garantindo que os usuários sejam mantidos informados sobre as atividades relevantes de forma organizada e eficiente.