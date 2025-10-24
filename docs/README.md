# 📚 Omnity Backend - Documentação Completa

> **Versão:** v0.0.1 | **Última atualização:** 2025-01-25

Bem-vindo à documentação oficial do backend Omnity. Esta API RESTful completa foi desenvolvida para gerenciamento de projetos, tarefas e requisitos com autenticação robusta e comunicação em tempo real.

## 🆕 **Últimas Atualizações (v0.0.1)**

- ✅ **Root route reestruturada** - Nova rota `GET /` com documentação precisa
- 📚 **API Overview** - Documentação completa de todos os endpoints reais
- 🏗️ **Código organizado** - Rotas separadas em arquivos dedicados
- 📝 **Schema Zod** - Validação tipada para respostas da API

## 🚀 Visão Geral

O Omnity Backend é uma API moderna construída com as melhores práticas de desenvolvimento, oferecendo:

- **Gerenciamento completo de projetos** com metadados flexíveis
- **Sistema de tarefas avançado** com checklist integrado
- **Gestão de requisitos** funcionais e não funcionais
- **Autenticação JWT** com refresh tokens
- **Comunicação em tempo real** via WebSocket
- **Multi-tenancy** para isolamento de dados
- **Sistema de notificações** inteligente
- **Tags personalizadas** para organização

## 🏗️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript
- **Framework**: Fastify (alta performance)
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT + bcryptjs
- **Validação**: Zod
- **WebSocket**: Socket.IO
- **Documentação**: Swagger/OpenAPI

## 📁 Estrutura da Documentação

### 🚀 **API Reference** (`docs/api/`)
- **[📖 Overview](./api/overview.md)** - **NOVO** - Visão geral completa da API
- **[📋 Changelog](./api/changelog.md)** - **NOVO** - Histórico de mudanças
- **[🔐 Authentication](./api/authentication.md)** - Sistema de autenticação JWT
- **[🏗️ Projects](./api/projects.md)** - Gestão completa de projetos
- **[📋 Tasks](./api/tasks.md)** - Sistema de tarefas com checklist
- **[📝 Requirements](./api/requirements.md)** - Gestão de requisitos
- **[🔔 Notifications](./api/notifications.md)** - Sistema de notificações

```
docs/
├── README.md                 # Este arquivo - visão geral
├── memory-index.md          # Índice de memória do sistema
├── architecture/            # Documentação de arquitetura
│   ├── overview.md         # Visão geral da arquitetura
│   ├── patterns.md         # Padrões arquiteturais
│   └── decisions.md        # Decisões de design
├── api/                    # Documentação das APIs
│   ├── authentication.md  # Endpoints de autenticação
│   ├── projects.md        # Gestão de projetos
│   ├── tasks.md           # Gestão de tarefas
│   ├── requirements.md    # Gestão de requisitos
│   ├── notifications.md   # Sistema de notificações
│   ├── tags.md            # Sistema de tags
│   └── websocket.md       # WebSocket em tempo real
├── database/              # Documentação de banco de dados
│   ├── schema.md         # Schema completo
│   ├── indexes.md        # Estratégia de indexação
│   ├── migrations.md     # Histórico de migrações
│   └── seeding.md        # População de dados
├── security/             # Documentação de segurança
│   ├── authentication.md # Sistema de autenticação
│   ├── authorization.md  # Controle de acesso
│   ├── validation.md     # Validação de dados
│   └── rate-limiting.md  # Proteção contra abusos
└── deployment/           # Guias de deployment
    ├── development.md    # Ambiente de desenvolvimento
    ├── production.md     # Ambiente de produção
    └── monitoring.md     # Monitoramento e logs
```

## 🎯 Principais Features

### 🔐 Autenticação & Segurança
- Sistema JWT com refresh tokens
- Rate limiting contra abusos
- Validação de força de senha
- Soft delete preventivo
- Multi-tenancy obrigatório

### 📊 Gestão de Projetos
- CRUD completo de projetos
- Metadados flexíveis (JSON)
- Sistema de favoritos
- Histórico completo de mudanças
- Tags personalizadas

### ✅ Gestão de Tarefas
- Sistema de status (Pendente → Em Progresso → Concluída)
- Checklist integrado (TaskTodos)
- Vinculação com requisitos
- Guidance prompts para execução
- Controle de responsáveis

### 📋 Gestão de Requisitos
- Classificação (Funcional vs Não Funcional)
- Sistema de prioridades
- Categorização flexível
- Vinculação N:M com tarefas
- Histórico completo

### 🔔 Notificações
- Sistema por usuário e projeto
- Prioridades configuráveis
- Metadados flexíveis
- Escopo global ou por projeto
- Índices otimizados

### ⚡ Tempo Real
- WebSocket com Socket.IO
- Autenticação de sockets
- Salas por projeto
- Eventos colaborativos
- Escalabilidade

## 🚀 Começando Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm 9+

### Instalação
```bash
# Clonar repositório
git clone https://github.com/omnity/backend.git
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações
npm run db:migrate

# Gerar cliente Prisma
npm run db:generate

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
# Database
DATABASE_URL="postgres://postgres:184b69d8e32e2917280d@cloud.nommand.com:54339/project_manger?sslmode=disable"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3000
NODE_ENV="development"
```

## 📖 Documentação Detalhada

Explore as seções específicas para informações detalhadas:

- **[Arquitetura](./architecture/overview.md)** - Design e padrões do sistema
- **[API Reference](./api/)** - Documentação completa dos endpoints
- **[Database](./database/)** - Schema e estratégias de banco
- **[Segurança](./security/)** - Implementações de segurança
- **[Deployment](./deployment/)** - Guias de deployment

## 🤝 Contribuição

Este projeto segue as melhores práticas de desenvolvimento:

1. **Type Safety**: TypeScript em todo o código
2. **Validação**: Zod para todos os inputs
3. **Testes**: Cobertura completa (em desenvolvimento)
4. **Documentação**: Sempre atualizada
5. **Segurança**: Multi-tenancy e validações

## 📄 Licença

MIT License - [LICENSE](../LICENSE)

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/omnity/backend/issues)
- **Documentation**: [Docs Site](https://docs.omnity.com)
- **Community**: [Discord](https://discord.gg/omnity)

---

**Omnity Backend** - Potencializando gestão de projetos com tecnologia de ponta. 🚀