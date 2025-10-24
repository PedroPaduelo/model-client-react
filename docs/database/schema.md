# 🗄️ Schema do Banco de Dados

Documentação completa do schema PostgreSQL com modelos, relacionamentos, índices e estratégias de performance implementadas no Omnity Backend.

## 🎯 Visão Geral

O banco de dados PostgreSQL foi projetado com foco em performance, escalabilidade e segurança, implementando multi-tenancy obrigatório, soft delete preventivo, auditoria completa e índices otimizados para todas as operações críticas.

## 📊 Conexão e Configuração

### Conexão
```env
DATABASE_URL="postgres://postgres:184b69d8e32e2917280d@cloud.nommand.com:54339/project_manger?sslmode=disable"
```

### Provider
- **Banco**: PostgreSQL
- **ORM**: Prisma
- **Pooling**: Gerenciado pelo Prisma
- **SSL**: Desabilitado por configuração específica

## 📋 Lista de Modelos

| Modelo | Descrição | Principal Relacionamento |
|--------|-----------|--------------------------|
| `User` | Usuários do sistema | 1:N para Projects, Notifications |
| `Project` | Projetos gerenciados | N:M com Tasks, Requirements |
| `Task` | Tarefas dos projetos | 1:N para TaskTodos |
| `Requirement` | Requisitos do projeto | N:M com Tasks |
| `TaskTodo` | Checklist de tarefas | 1:N com Task |
| `Notification` | Notificações de usuários | 1:N com User, Project |
| `Tag` | Tags personalizadas | N:M com Projects |
| `ProjectHistory` | Histórico de mudanças | 1:N com Project |
| `Token` | Tokens de segurança | 1:N com User |

## 📝 Modelos Detalhados

### 1. User (tbl_user)

**Descrição**: Entidade principal de usuários com autenticação completa.

```sql
CREATE TABLE tbl_user (
  id            VARCHAR(25)   PRIMARY KEY DEFAULT cuid(),
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  emailVerified TIMESTAMP,
  image         VARCHAR(255),
  password      VARCHAR(255),
  firstName     VARCHAR(255)  NOT NULL,
  lastName      VARCHAR(255),
  dateOfBirth   TIMESTAMP,
  isActive      BOOLEAN       DEFAULT true,
  avatarUrl     VARCHAR(255),
  createdAt     TIMESTAMP     DEFAULT now(),
  updatedAt     TIMESTAMP     DEFAULT now(),
  deletedAt     TIMESTAMP
);
```

**Campos Principais**:
- `id`: Identificador único (cuid)
- `email`: Email único (incluindo soft deletes)
- `password`: Hash bcrypt (12 rounds)
- `isActive`: Controle de acesso do usuário
- `deletedAt`: Soft delete preventivo

**Índices**:
```sql
CREATE INDEX idx_user_is_active ON tbl_user(is_active);
CREATE INDEX idx_user_created_at ON tbl_user(created_at);
CREATE INDEX idx_user_email ON tbl_user(email);
```

**Relacionamentos**:
- `projects` → Project[] (1:N)
- `notifications` → Notification[] (1:N)
- `tokens` → Token[] (1:N)
- `createdTags` → Tag[] (1:N)

---

### 2. Project (tbl_project)

**Descrição**: Entidade central de projetos com metadados completos.

```sql
CREATE TABLE tbl_project (
  id               SERIAL        PRIMARY KEY,
  name             VARCHAR(255)  NOT NULL,
  description      TEXT          NOT NULL,
  stack            VARCHAR(500)  NOT NULL,
  notes            TEXT,
  lastModel        VARCHAR(100),
  status           VARCHAR(50)   DEFAULT 'Ativo',
  priority         VARCHAR(50)   DEFAULT 'Média',
  progress         INTEGER       DEFAULT 0,
  isFavorite       BOOLEAN       DEFAULT false,
  metadata         JSONB,
  gitRepositoryUrl VARCHAR(500),
  createdAt        TIMESTAMP     DEFAULT now(),
  updatedAt        TIMESTAMP     DEFAULT now(),
  deletedAt        TIMESTAMP,
  userId           VARCHAR(25)   NOT NULL
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `name`: Nome do projeto (3-100 caracteres)
- `description`: Descrição detalhada
- `stack`: Stack tecnológico (separado por vírgulas)
- `status`: Status do projeto (enum)
- `priority`: Prioridade (Baixa, Média, Alta, Crítica)
- `progress`: Progresso numérico (0-100)
- `isFavorite`: Sistema de favoritos
- `metadata`: Metadados flexíveis (JSON)
- `userId`: Multi-tenancy obrigatório

**Índices Otimizados**:
```sql
CREATE INDEX idx_project_created_at ON tbl_project(created_at);
CREATE INDEX idx_project_updated_at ON tbl_project(updated_at);
CREATE INDEX idx_projects_created_name ON tbl_project(created_at, name);
CREATE INDEX idx_project_status ON tbl_project(status);
CREATE INDEX idx_project_priority ON tbl_project(priority);
CREATE INDEX idx_project_favorite ON tbl_project(is_favorite);
CREATE INDEX idx_project_progress ON tbl_project(progress);
CREATE INDEX idx_project_created_status ON tbl_project(created_at, status);
```

**Relacionamentos**:
- `user` → User (N:1)
- `tasks` → Task[] (1:N)
- `requirements` → Requirement[] (1:N)
- `notifications` → Notification[] (1:N)
- `projectTags` → ProjectTag[] (1:N)
- `projectHistory` → ProjectHistory[] (1:N)

---

### 3. Task (tbl_tasks)

**Descrição**: Tarefas com sistema de checklist integrado.

```sql
CREATE TABLE tbl_tasks (
  id                    SERIAL        PRIMARY KEY,
  title                 VARCHAR(255)  NOT NULL,
  guidancePrompt        TEXT          NOT NULL,
  additionalInformation TEXT,
  description           TEXT,
  status                VARCHAR(50)   DEFAULT 'Pendente',
  createdBy             VARCHAR(25)   NOT NULL,
  updatedBy             VARCHAR(25)   NOT NULL,
  projectId             INTEGER       NOT NULL,
  result                TEXT,
  createdAt             TIMESTAMP     DEFAULT now(),
  updatedAt             TIMESTAMP     DEFAULT now()
);
```

**Campos Principais**:
- `title`: Título da tarefa (3-200 caracteres)
- `guidancePrompt`: Instruções detalhadas de execução
- `status`: Status da tarefa (Pendente, Em Progresso, Concluída, etc.)
- `createdBy/updatedBy`: Controle de responsáveis
- `projectId`: Vínculo com projeto
- `result`: Resultado da tarefa após conclusão

**Índices Otimizados**:
```sql
CREATE INDEX idx_tasks_project_status_created_at ON tbl_tasks(project_id, status, created_at);
CREATE INDEX idx_tasks_status_created_at ON tbl_tasks(status, created_at);
CREATE INDEX idx_tasks_project_id_created_at ON tbl_tasks(project_id, created_at);
CREATE INDEX idx_tasks_project_status_count ON tbl_tasks(project_id, status);
CREATE INDEX idx_tasks_created_by_created_at ON tbl_tasks(created_by, created_at);
CREATE INDEX idx_tasks_updated_by_updated_at ON tbl_tasks(updated_by, updated_at);
```

**Relacionamentos**:
- `project` → Project (N:1)
- `taskTodos` → TaskTodo[] (1:N)
- `requirementTasks` → RequirementTask[] (1:N)

---

### 4. TaskTodo (tbl_task_todos)

**Descrição**: Checklist aninhado para rastreabilidade detalhada.

```sql
CREATE TABLE tbl_task_todos (
  id          SERIAL     PRIMARY KEY,
  taskId      INTEGER    NOT NULL,
  description TEXT       NOT NULL,
  isCompleted BOOLEAN    DEFAULT false,
  sequence    INTEGER    DEFAULT 0,
  createdAt   TIMESTAMP  DEFAULT now(),
  updatedAt   TIMESTAMP  DEFAULT now()
);
```

**Campos Principais**:
- `taskId`: Vínculo com tarefa
- `description`: Descrição do item do checklist
- `isCompleted`: Status de conclusão
- `sequence`: Ordem sequencial

**Índices**:
```sql
CREATE INDEX idx_task_todos_task_id ON tbl_task_todos(task_id);
CREATE INDEX idx_task_todos_is_completed ON tbl_task_todos(is_completed);
CREATE INDEX idx_task_todos_task_id_completed ON tbl_task_todos(task_id, is_completed);
CREATE INDEX idx_task_todos_sequence ON tbl_task_todos(sequence);
```

---

### 5. Requirement (tbl_requisitos)

**Descrição**: Requisitos funcionais e não funcionais.

```sql
CREATE TABLE tbl_requisitos (
  id          SERIAL      PRIMARY KEY,
  titulo      VARCHAR(255) NOT NULL,
  descricao   TEXT        NOT NULL,
  tipo        VARCHAR(50)  NOT NULL,
  categoria   VARCHAR(100),
  prioridade  VARCHAR(50)  DEFAULT 'Média',
  projectId   INTEGER     NOT NULL,
  createdAt   TIMESTAMP   DEFAULT now(),
  updatedAt   TIMESTAMP   DEFAULT now()
);
```

**Campos Principais**:
- `titulo`: Título do requisito
- `descricao`: Descrição detalhada
- `tipo`: Funcional ou Não Funcional
- `categoria`: Categoria organizacional
- `prioridade`: Nível de prioridade
- `projectId`: Vínculo com projeto

**Índices**:
```sql
CREATE INDEX idx_requisitos_project_priority_created ON tbl_requisitos(project_id, prioridade, created_at);
CREATE INDEX idx_requisitos_project_created_at ON tbl_requisitos(project_id, created_at);
CREATE INDEX idx_requisitos_project_updated_at ON tbl_requisitos(project_id, updated_at);
CREATE INDEX idx_requisitos_created_at ON tbl_requisitos(created_at);
CREATE INDEX idx_requisitos_project_count ON tbl_requisitos(project_id);
```

---

### 6. Notification (tbl_notification)

**Descrição**: Sistema de notificações inteligente.

```sql
CREATE TABLE tbl_notification (
  id        SERIAL     PRIMARY KEY,
  projectId INTEGER,
  userId    VARCHAR(25) NOT NULL,
  type      VARCHAR(100) NOT NULL,
  title     VARCHAR(255) NOT NULL,
  message   TEXT        NOT NULL,
  metadata  JSONB,
  isRead    BOOLEAN     DEFAULT false,
  priority  VARCHAR(50)  DEFAULT 'Média',
  createdAt TIMESTAMP   DEFAULT now(),
  readAt    TIMESTAMP
);
```

**Campos Principais**:
- `userId`: Destinatário da notificação
- `projectId`: Escopo (opcional)
- `type`: Tipo de notificação
- `title/mensagem`: Conteúdo da notificação
- `isRead`: Status de leitura
- `priority`: Prioridade da notificação
- `metadata`: Dados adicionais (JSON)

**Índices Otimizados**:
```sql
CREATE INDEX idx_notification_user_read_created ON tbl_notification(user_id, is_read, created_at);
CREATE INDEX idx_notification_user_priority_created ON tbl_notification(user_id, priority, created_at);
CREATE INDEX idx_notification_project_created ON tbl_notification(project_id, created_at);
CREATE INDEX idx_notification_type_priority_created ON tbl_notification(type, priority, created_at);
CREATE INDEX idx_notification_user_id ON tbl_notification(user_id);
CREATE INDEX idx_notification_project_id ON tbl_notification(project_id);
CREATE INDEX idx_notification_is_read ON tbl_notification(is_read);
CREATE INDEX idx_notification_type ON tbl_notification(type);
CREATE INDEX idx_notification_priority ON tbl_notification(priority);
CREATE INDEX idx_notification_created_at ON tbl_notification(created_at);
```

---

### 7. Tag (tbl_tag)

**Descrição**: Tags personalizadas para organização.

```sql
CREATE TABLE tbl_tag (
  id          SERIAL      PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  color       VARCHAR(7),
  description TEXT,
  createdBy   VARCHAR(25) NOT NULL,
  createdAt   TIMESTAMP   DEFAULT now(),
  updatedAt   TIMESTAMP   DEFAULT now()
);
```

**Campos Principais**:
- `name`: Nome único da tag
- `color`: Cor hexadecimal para organização visual
- `description`: Descrição opcional
- `createdBy`: Criador da tag

---

### 8. Relacionamentos N:M

#### ProjectTag (tbl_project_tag)
```sql
CREATE TABLE tbl_project_tag (
  id        SERIAL    PRIMARY KEY,
  projectId INTEGER   NOT NULL,
  tagId     INTEGER   NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  UNIQUE(projectId, tagId)
);
```

#### RequirementTask (tbl_requisitos_tasks)
```sql
CREATE TABLE tbl_requisitos_tasks (
  id            SERIAL     PRIMARY KEY,
  taskId        INTEGER    NOT NULL,
  requirementId INTEGER    NOT NULL,
  createdAt     TIMESTAMP  DEFAULT now(),
  updatedAt     TIMESTAMP  DEFAULT now(),
  UNIQUE(taskId, requirementId)
);
```

---

### 9. ProjectHistory (tbl_project_history)

**Descrição**: Audit trail completo para projetos.

```sql
CREATE TABLE tbl_project_history (
  id          SERIAL     PRIMARY KEY,
  projectId   INTEGER    NOT NULL,
  action      VARCHAR(100) NOT NULL,
  entityType  VARCHAR(100) NOT NULL,
  entityId    INTEGER,
  oldValues   JSONB,
  newValues   JSONB,
  userId      VARCHAR(25) NOT NULL,
  userName    VARCHAR(255),
  description TEXT       NOT NULL,
  createdAt  TIMESTAMP   DEFAULT now()
);
```

**Índices Otimizados**:
```sql
CREATE INDEX idx_history_project_created ON tbl_project_history(project_id, created_at);
CREATE INDEX idx_history_project_action_created ON tbl_project_history(project_id, action, created_at);
CREATE INDEX idx_history_project_entity_created ON tbl_project_history(project_id, entity_type, created_at);
CREATE INDEX idx_history_user_created ON tbl_project_history(user_id, created_at);
CREATE INDEX idx_history_action ON tbl_project_history(action);
CREATE INDEX idx_history_entity_type ON tbl_project_history(entity_type);
CREATE INDEX idx_history_created_at ON tbl_project_history(created_at);
CREATE INDEX idx_history_user_id ON tbl_project_history(user_id);
CREATE INDEX idx_history_entity_id_type ON tbl_project_history(entity_id, entity_type);
```

---

### 10. Token (tbl_token)

**Descrição**: Tokens para segurança e recuperação.

```sql
CREATE TABLE tbl_token (
  id        SERIAL      PRIMARY KEY,
  type      VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP   DEFAULT now(),
  expiresAt TIMESTAMP   NOT NULL,
  userId    VARCHAR(25) NOT NULL
);
```

**Enum de Tipos**:
```sql
CREATE TYPE token_type AS ENUM ('PASSWORD_RECOVER');
```

---

## 📊 Estratégia de Indexação

### Índices Compostos
- **Performance**: Criados para queries com múltiplos filtros
- **Covering Indexes**: Incluem todos os campos necessários
- **Order By**: Suportam ordenação eficiente

### Índices Únicos
- **Email**: Único globalmente (incluindo soft deletes)
- **Tags**: Nomes únicos para evitar duplicação
- **Relacionamentos**: Restringem duplicações em N:M

### Índices de Performance
- **Tempo**: Ordenação por data em listagens
- **Status**: Filtros frequentes por status
- **Usuário**: Multi-tenancy obrigatório
- **Prioridade**: Filtros por importância

## 🔧 Enums e Constraints

### Enums Implementados
```sql
-- Tipos de Token
CREATE TYPE token_type AS ENUM ('PASSWORD_RECOVER');

-- (Outros enums são implementados via validação de aplicação)
-- Status de Projeto: Ativo, Pausado, Concluído, Cancelado, Em Andamento
-- Prioridade: Baixa, Média, Alta, Crítica
-- Status de Tarefa: Pendente, Em Progresso, Concluída, Bloqueada, Em Revisão
-- Tipo de Requisito: Funcional, Não Funcional
```

### Constraints de Negócio
- **Multi-tenancy**: `userId` obrigatório em entidades principais
- **Soft Delete**: `deletedAt` para preservação de dados
- **Validação**: Constraints de NOT NULL onde aplicável
- **Relacionamentos**: Foreign keys com CASCADE apropriado

## 🚀 Performance e Otimização

### Estratégias de Query
1. **Filtros no Banco**: Sempre que possível
2. **Paginação**: LIMIT/OFFSET eficientes
3. **Seleção Específica**: Apenas campos necessários
4. **Join Queries**: Evitar N+1 problems

### Análise de Performance
- **EXPLAIN ANALYZE** para queries críticas
- **Índices monitorados** para uso efetivo
- **Slow queries** registradas e otimizadas
- **Connection pooling** via Prisma

## 🔐 Segurança de Dados

### Multi-Tenancy
- **Isolamento obrigatório** por `userId`
- **Validação em API** e nível de banco
- **Proteção contra acesso cross-tenant**

### Soft Delete
- **Prevenção de reuso** de emails comprometidos
- **Audit trail** completo
- **Recuperação possível** quando necessário

### Validações
- **Email único** incluindo soft deletes
- **Relacionamentos consistentes**
- **Integridade referencial** mantida

## 📈 Monitoramento e Manutenção

### Métricas Importantes
- **Tamanho das tabelas** e crescimento
- **Performance dos índices**
- **Query execution times**
- **Connection pool usage**

### Manutenção Programada
- **VACUUM** regular para otimização
- **ANALYZE** para estatísticas atualizadas
- **Rebuild de índices** quando necessário
- **Backup strategy** implementada

---

Este schema foi projetado para suportar crescimento escalável, manter alta performance e garantir a segurança e integridade dos dados do sistema Omnity.