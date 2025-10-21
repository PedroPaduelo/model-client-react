# 🏗️ Arquitetura do Omnity Backend

## Visão Geral

O Omnity Backend segue uma arquitetura modular e escalável, projetada para alta performance e manutenibilidade. A arquitetura é baseada em padrões modernos de desenvolvimento de APIs RESTful com foco em segurança, multi-tenancy e comunicação em tempo real.

## 🎯 Princípios Arquiteturais

### 1. **Modularidade**
- Separação clara de responsabilidades
- Módulos independentes e coesos
- Baixo acoplamento entre componentes

### 2. **Performance**
- Fastify como framework principal
- Índices otimizados no banco
- Conexões eficientes com PostgreSQL
- Cache onde aplicável

### 3. **Segurança**
- Multi-tenancy obrigatório
- Validação rigorosa de inputs
- Autenticação JWT robusta
- Rate limiting contra abusos

### 4. **Escalabilidade**
- Design stateless
- Comunicação assíncrona
- Separação de responsabilidades
- Horizontal scaling ready

## 🏛️ Estrutura do Projeto

```
backend/
├── src/
│   ├── http/                  # Camada HTTP
│   │   ├── routes/           # Definição de rotas
│   │   └── error-handler.ts  # Handler global de erros
│   ├── lib/                  # Bibliotecas e utilitários
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── rate-limiter.ts   # Rate limiting
│   │   └── jwt.ts           # Utilitários JWT
│   ├── middlewares/          # Middlewares custom
│   ├── socket/              # WebSocket handlers
│   ├── utils/               # Funções utilitárias
│   ├── @types/              # Tipos TypeScript
│   └── server.ts            # Entry point
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   ├── migrations/          # Migrações
│   └── seed.ts              # População de dados
└── docs/                    # Documentação
```

## 🔧 Camadas da Arquitetura

### 1. **Camada de Apresentação (HTTP)**
Responsável pela comunicação com clientes através de HTTP/REST.

```typescript
// src/http/routes/
├── auth/           # Autenticação de usuários
├── projects/       # Gestão de projetos
├── tasks/         # Gestão de tarefas
├── requirements/  # Gestão de requisitos
├── notifications/ # Sistema de notificações
└── tags/          # Sistema de tags
```

**Responsabilidades:**
- Definição de endpoints
- Validação de inputs (Zod)
- Transformação de dados
- Respostas HTTP

### 2. **Camada de Negócio (Lib)**
Contém a lógica de negócio e regras do sistema.

```typescript
// src/lib/
├── prisma.ts       # ORM e database
├── rate-limiter.ts # Proteção contra abusos
├── jwt.ts         # Autenticação
└── validators.ts  # Validações custom
```

**Responsabilidades:**
- Regras de negócio
- Interações com banco
- Validações custom
- Autenticação/autorização

### 3. **Camada de Dados (Prisma)**
Gerenciamento de persistência e acesso a dados.

```typescript
// prisma/schema.prisma
model User      { ... }  # Usuários do sistema
model Project   { ... }  # Projetos
model Task      { ... }  # Tarefas
model Requirement { ... } # Requisitos
// ... outros modelos
```

**Responsabilidades:**
- Schema de dados
- Migrações
- Relacionamentos
- Índices e performance

### 4. **Camada de Tempo Real (WebSocket)**
Comunicação em tempo real via Socket.IO.

```typescript
// src/socket/
├── index.ts       # Configuração do servidor
├── handlers/      # Event handlers
└── middleware/    # Autenticação de sockets
```

**Responsabilidades:**
- Conexões WebSocket
- Eventos em tempo real
- Salas por projeto
- Autenticação de sockets

## 🔄 Fluxo de Dados

### 1. **Requisição HTTP Típica**

```
Client → Fastify → Validation → Authentication → Business Logic → Database → Response
```

1. **Client**: Envia requisição HTTP
2. **Fastify**: Recebe e processa a requisição
3. **Validation**: Valida inputs com Zod
4. **Authentication**: Verifica token JWT
5. **Business Logic**: Executa lógica de negócio
6. **Database**: Interage com PostgreSQL via Prisma
7. **Response**: Retorna resposta formatada

### 2. **WebSocket Event Flow**

```
Client → Socket.IO → Authentication → Room Management → Event Handler → Broadcast
```

1. **Client**: Conecta via WebSocket
2. **Socket.IO**: Gerencia conexão
3. **Authentication**: Valida token JWT
4. **Room Management**: Adiciona a salas específicas
5. **Event Handler**: Processa eventos
6. **Broadcast**: Envia para clientes conectados

## 🔐 Modelo de Segurança

### Multi-Tenancy
Todos os dados são isolados por usuário através do campo `userId`:

```typescript
// Exemplo: Todos os modelos principais tem userId
model Project {
  userId String @map("user_id")
  user   User   @relation("ProjectOwner", fields: [userId], references: [id])
  // ... outros campos
}
```

### Autenticação JWT
- Access tokens de curta duração
- Refresh tokens persistidos
- Middleware de verificação em rotas protegidas
- Blacklist de emails maliciosos

### Rate Limiting
- Proteção contra força bruta
- Limites por IP + email
- Reset automático
- Configuração flexível

## 📊 Estratégia de Performance

### Índices Otimizados
Cada modelo tem índices específicos para suas queries mais comuns:

```typescript
// Exemplo: Índices do Project
@@index([createdAt], name: "idx_project_created_at")
@@index([status], name: "idx_project_status")
@@index([userId, createdAt], name: "idx_projects_user_created")
```

### Queries Eficientes
- Uso de Prisma para queries otimizadas
- Seleção específica de campos
- Paginação implementada
- Evita N+1 problems

### Cache Estratégico
- Cache de sessões JWT
- Rate limiting em memória
- Possibilidade de Redis para cache avançado

## 🚀 Padrões de Comunicação

### API RESTful
- Verbos HTTP apropriados (GET, POST, PUT, DELETE, PATCH)
- Status codes corretos
- Respostas consistentes
- Versionamento ready

### WebSocket Events
- Eventos nomeados semanticamente
- Payloads validados
- Room-based broadcasting
- Error handling

## 🔧 Componentes Principais

### 1. **Fastify Server**
```typescript
// src/server.ts
const app = fastify({
  logger: true,
  typeProvider: fastifyTypeProviderZod
})
```

### 2. **Prisma Client**
```typescript
// src/lib/prisma.ts
export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})
```

### 3. **JWT Authentication**
```typescript
// src/lib/jwt.ts
export async function verifyJWT(token: string) {
  return await app.jwt.verify(token)
}
```

### 4. **Rate Limiter**
```typescript
// src/lib/rate-limiter.ts
export const rateLimiter = new Map<string, UserAttempts>()
```

## 📈 Monitoramento e Observabilidade

### Logging
- Logs estruturados com Fastify
- Níveis de log configuráveis
- Context tracing

### Health Checks
- Endpoint `/health` para monitoramento
- Verificação de conexão com banco
- Status da aplicação

### Metrics (Futuro)
- Response times
- Error rates
- Database performance
- WebSocket connections

## 🔄 Escalabilidade

### Horizontal Scaling
- Stateless design
- Load balancing ready
- Database connection pooling
- WebSocket session storage

### Vertical Scaling
- Configuração de recursos
- Memory management
- CPU optimization

## 🧪 Testes (Planejado)

### Estratégia de Testes
- Unit tests para lógica de negócio
- Integration tests para APIs
- E2E tests para fluxos completos
- Performance tests

### Cobertura
- Cobertura de código > 90%
- Testes de segurança
- Testes de performance
- Testes de integração

## 📝 Convenções e Padrões

### Código
- TypeScript strict mode
- ESLint + Prettier
- Convenções de nomenclatura
- Component-based structure

### Banco de Dados
- Snake case para nomes
- Soft delete obrigatório
- Timestamps automáticos
- Índices otimizados

### API
- RESTful principles
- Versionamento semantic
- Error handling consistente
- Documentação automática

---

Esta arquitetura foi projetada para evoluir com o negócio, mantendo performance, segurança e escalabilidade como pilares fundamentais.