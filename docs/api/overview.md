# 🚀 API Overview - Nommand Desk

Visão geral completa da API RESTful para gerenciamento de projetos, tarefas, requisitos e comunicação em tempo real.

## 🎯 Visão Geral

A Nommand Desk API é uma solução completa para gestão de projetos que oferece endpoints robustos para autenticação, gestão de projetos, tarefas com checklist, requisitos, notificações e muito mais. Construída com Fastify, TypeScript e PostgreSQL, segue os melhores práticas de segurança e performance.

## 📋 Estrutura da API

### 🔐 **Autenticação** (`/auth`)
Gestão completa de usuários com JWT e segurança avançada
- ✅ Cadastro de usuários com validação
- ✅ Login com rate limiting
- ✅ Recuperação e reset de senha
- ✅ Gestão de perfil

### 🏗️ **Projetos** (`/projects`)
Sistema completo de gestão de projetos com recursos avançados
- ✅ CRUD completo de projetos
- ✅ Sistema de favoritos
- ✅ Controle de progresso (0-100%)
- ✅ Paginação e filtros avançados
- ✅ Soft delete para segurança

### 📋 **Tarefas** (`/projects/:id/tasks`)
Gestão de tarefas com sistema de checklist integrado
- ✅ CRUD completo de tarefas
- ✅ Fluxo de status completo
- ✅ Sub-recurso **task-todos** para checklist
- ✅ Vinculação direta com requisitos
- ✅ Histórico de alterações

### 📝 **Requisitos** (`/projects/:id/requirements`)
Gestão de requisitos funcionais e não funcionais
- ✅ CRUD de requisitos
- ✅ Classificação por prioridade
- ✅ Vinculação direta com tarefas
- ✅ Categorias personalizadas

### 🔔 **Notificações** (`/notifications`)
Sistema inteligente de notificações
- ✅ Notificações automáticas
- ✅ Sistema de prioridades
- ✅ Controle de leitura
- ✅ Por usuário e projeto

### 🏷️ **Tags** (`/tags`)
Sistema de categorização
- ✅ Tags globais
- ✅ Associação com projetos
- ✅ Organização personalizável

### 📊 **Analytics** (`/analytics`)
Análise e estatísticas
- ✅ Dashboard analytics
- ✅ Estatísticas por projeto
- ✅ Métricas de progresso

### 📜 **Histórico** (`/projects/:id/history`)
Rastreamento completo de atividades
- ✅ Histórico de projetos
- ✅ Log de alterações
- ✅ Audit trail completo

## 🔌 **WebSocket** (`/socket.io`)
Comunicação em tempo real
- ✅ Salas por projeto
- ✅ Eventos customizados
- ✅ Autenticação via JWT

## 🌐 **Documentação Interativa**
- ✅ **Swagger UI:** `GET /docs`
- ✅ **API Overview:** `GET /` (esta página)
- ✅ **Health Check:** `GET /health`

## 🔧 **Stack Tecnológico**

### **Backend**
- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript
- **Framework:** Fastify
- **ORM:** Prisma
- **Database:** PostgreSQL

### **Segurança**
- **Autenticação:** JWT
- **Password Hashing:** bcryptjs
- **Rate Limiting:** Proteção contra abusos
- **Validation:** Zod schemas
- **CORS:** Configuração segura

### **Real-time**
- **WebSocket:** Socket.IO
- **Event-driven:** Arquitetura baseada em eventos
- **Rooms:** Isolamento por projeto

## 🏗️ **Padrões Arquiteturais**

### **Multi-tenancy**
- Isolamento completo por `user_id`
- Proteção contra acesso cruzado
- Escopo em todas as queries

### **Soft Deletes**
- Prevenção de perda de dados
- Campos `deletedAt` em tabelas principais
- Recuperação possível

### **Paginação & Filtros**
- Paginação consistente (page, limit, total)
- Filtros avançados em listagens
- Busca textual (search)

### **Validação & Tipagem**
- Schemas Zod para validação
- TypeScript full-stack
- Autocomplete e segurança

## 📊 **Estrutura de Dados**

### **Relacionamentos Principais**
```
user (1:N) projects
projects (1:N) tasks
projects (1:N) requirements
tasks (1:N) task_todos
requirements (N:M) tasks (via requirement_task)
projects (N:M) tags (via project_tag)
```

### **Fluxo de Status**

#### **Projetos**
- `Ativo` → `Pausado` → `Concluído` / `Cancelado`

#### **Tarefas**
- `Pendente` → `Em Progresso` → `Bloqueada` → `Em Revisão` → `Concluída`

#### **Requisitos**
- Prioridade: `Baixa` → `Média` → `Alta` → `Crítica`

## 🔐 **Autenticação & Autorização**

### **JWT Tokens**
- **Access Token:** 15 minutos (API requests)
- **Bearer Format:** Header `Authorization: Bearer <token>`
- **WebSocket:** Campo `auth` na conexão

### **Middleware de Autenticação**
- Validação de token em rotas protegidas
- Extração automática do `user_id`
- Refresh automático em background

### **Rate Limiting**
- **Login:** 5 tentativas / 15 min
- **Cadastro:** 3 tentativas / 30 min
- **Recuperação:** 3 tentativas / 1 hora

## 📈 **Performance & Monitoramento**

### **Índices Optimizados**
- Índices compostos em queries principais
- Performance em queries com filtros
- Escalabilidade para grandes volumes

### **Monitoramento**
- Health checks automáticos
- Logging estruturado
- Metrics de performance

## 🚀 **Guia de Uso Rápido**

### **1. Autenticação**
```bash
# Criar usuário
curl -X POST /users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST /sessions/password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

### **2. Criar Projeto**
```bash
curl -X POST /projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Project description","stack":"Node.js,React"}'
```

### **3. Gerenciar Tarefas**
```bash
# Listar tarefas
curl -X GET /projects/1/tasks \
  -H "Authorization: Bearer <token>"

# Criar tarefa
curl -X POST /projects/1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","guidancePrompt":"How to implement"}'
```

## 📚 **Documentação Detalhada**

- **[🔐 Autenticação](./authentication.md)** - Sistema completo de autenticação
- **[🏗️ Projetos](./projects.md)** - Gestão completa de projetos
- **[📋 Tarefas](./tasks.md)** - Sistema de tarefas com checklist
- **[📝 Requisitos](./requirements.md)** - Gestão de requisitos
- **[🔔 Notificações](./notifications.md)** - Sistema de notificações

## 🔄 **Atualizações Recentes**

- **2025-01-25:** ✅ **Root route reestruturada**
  - Nova rota `GET /` com documentação completa
  - Schema Zod para validação
  - Documentação real das APIs implementadas
  - Removida documentação do easy-panel

- **2025-01-04:** ✅ **Documentação completa**
  - Documentação de todas as APIs
  - Schema detalhado do database
  - Guias de deployment e segurança

---

## 🎯 **Próximos Passos**

1. **Explore a documentação interativa** em `/docs`
2. **Teste os endpoints** com os exemplos acima
3. **Configure o WebSocket** para notificações em tempo real
4. **Monitore** performance e health checks

**🚀 Ready to build amazing projects!**