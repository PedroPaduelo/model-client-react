# 📚 API Reference Completa - Nommand Integration

Documentação completa de todas as APIs de integração com a plataforma Nommand implementadas no sistema.

## 📋 Índice

1. [🔐 Token Management](#-token-management)
2. [⚡ Actions](#-actions)
3. [🌐 Domains](#-domains)
4. [🚀 Services](#-services)
5. [📊 Analytics](#-analytics)
6. [🔧 Common Features](#-common-features)

---

## 🔐 Token Management

### Gerenciamento de tokens da API Nommand com cache inteligente.

### 1. Obter Informações do Token
- **Método:** `GET`
- **Endpoint:** `/nommand/token-info`
- **Descrição:** Obtém informações sobre o token atual da API Nommand

#### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Response (200)
```json
{
  "token": "string | null",
  "expiresAt": "number | null",
  "timeUntilExpiry": "number | null"
}
```

#### Exemplo
```bash
curl -X GET \
  'http://localhost:3333/nommand/token-info' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2. Renovar Token
- **Método:** `POST`
- **Endpoint:** `/nommand/renew-token`
- **Descrição:** Força a renovação do token da API Nommand

#### Response (200)
```json
{
  "success": true,
  "message": "Token renewed successfully",
  "token": "cmh00hluo002g07pdhjmlbggi..."
}
```

#### Exemplo
```bash
curl -X POST \
  'http://localhost:3333/nommand/renew-token' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3. Testar Sistema de Token
- **Método:** `GET`
- **Endpoint:** `/nommand/test-token`
- **Descrição:** Testa o sistema completo de geração e cache de tokens

#### Response (200)
```json
{
  "success": true,
  "message": "Nommand API token system working correctly",
  "tokenGenerated": true,
  "cacheStatus": "Valid token in cache"
}
```

#### Exemplo
```bash
curl -X GET \
  'http://localhost:3333/nommand/test-token' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## ⚡ Actions

### Gestão de actions (ações/execuções) na plataforma Nommand.

### 1. Listar Actions
- **Método:** `GET`
- **Endpoint:** `/actions/list-actions`
- **Descrição:** Lista todas as actions de um serviço específico

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| projectName | string | Sim | Nome do projeto |
| serviceName | string | Sim | Nome do serviço |
| limit | number | Não | Limite de resultados (default: 8, max: 100) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "action_id",
      "type": "deploy",
      "status": "completed",
      "createdAt": "2025-01-19T10:00:00Z",
      "updatedAt": "2025-01-19T10:05:00Z",
      "logs": ["Build started", "Build completed"]
    }
  ],
  "message": "Actions retrieved successfully"
}
```

#### Exemplo
```bash
curl -X GET \
  'http://localhost:3333/actions/list-actions?projectName=teste&serviceName=app-principal&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2. Obter Action Específica
- **Método:** `GET`
- **Endpoint:** `/actions/get-action`
- **Descrição:** Obtém detalhes de uma action específica por ID

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| id | string | Sim | ID da action |

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "action_id",
    "type": "deploy",
    "status": "running",
    "createdAt": "2025-01-19T10:00:00Z",
    "updatedAt": "2025-01-19T10:02:00Z",
    "logs": ["Starting deployment..."],
    "metadata": {
      "branch": "main",
      "commit": "abc123"
    }
  },
  "message": "Action retrieved successfully"
}
```

#### Exemplo
```bash
curl -X GET \
  'http://localhost:3333/actions/get-action?id=cmh01ln4v002n07pdgod06spv' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 🌐 Domains

### Gestão completa de domínios na plataforma Nommand.

### 1. Listar Domínios
- **Método:** `GET`
- **Endpoint:** `/domains/list-domains`
- **Descrição:** Lista todos os domínios configurados para um serviço

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| projectName | string | Sim | Nome do projeto |
| serviceName | string | Sim | Nome do serviço |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "domain_id",
      "https": true,
      "host": "app.example.com",
      "path": "/",
      "middlewares": [],
      "certificateResolver": "",
      "wildcard": false,
      "destinationType": "service",
      "serviceDestination": {
        "protocol": "http",
        "port": 3000,
        "path": "/",
        "projectName": "teste",
        "serviceName": "app-principal"
      }
    }
  ],
  "message": "Domains listed successfully"
}
```

### 2. Criar Domínio
- **Método:** `POST`
- **Endpoint:** `/domains/create-domain`
- **Descrição:** Cria um novo domínio na plataforma

#### Body Parameters
```json
{
  "https": true,
  "host": "new.example.com",
  "path": "/",
  "middlewares": [],
  "certificateResolver": "",
  "wildcard": false,
  "destinationType": "service",
  "serviceDestination": {
    "protocol": "http",
    "port": 3000,
    "path": "/",
    "projectName": "teste",
    "serviceName": "app-principal"
  }
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "result": {
      "data": {
        "json": null,
        "meta": {
          "values": ["undefined"]
        }
      }
    }
  },
  "message": "Domain created successfully"
}
```

### 3. Atualizar Domínio
- **Método:** `PUT`
- **Endpoint:** `/domains/update-domain`
- **Descrição:** Atualiza um domínio existente

#### Body Parameters
```json
{
  "id": "domain_id",
  "https": true,
  "host": "updated.example.com",
  "path": "/",
  "middlewares": [],
  "certificateResolver": "",
  "wildcard": false,
  "destinationType": "service",
  "serviceDestination": {
    "protocol": "http",
    "port": 3000,
    "path": "/",
    "projectName": "teste",
    "serviceName": "app-principal"
  }
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "result": {
      "data": {
        "json": null,
        "meta": {
          "values": ["undefined"]
        }
      }
    }
  },
  "message": "Domain updated successfully"
}
```

---

## 🚀 Services

### Gestão completa de serviços na plataforma Nommand.

### 1. Criar Serviço
- **Método:** `POST`
- **Endpoint:** `/services/create-service`
- **Descrição:** Cria um novo serviço na plataforma

#### Body Parameters
```json
{
  "projectName": "novo-projeto",
  "serviceName": "api-service",
  "build": {
    "type": "nixpacks"
  },
  "env": "NODE_ENV=production\nPORT=3000\nAPI_KEY=secret"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "service_id",
    "name": "api-service",
    "status": "created"
  },
  "message": "Service created successfully"
}
```

### 2. Atualizar Source GitHub
- **Método:** `POST`
- **Endpoint:** `/services/update-source-github`
- **Descrição:** Configura integração com repositório GitHub

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app",
  "owner": "username",
  "repo": "repository",
  "ref": "main",
  "path": "/",
  "autoDeploy": true
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "source": {
      "type": "github",
      "owner": "username",
      "repo": "repository",
      "ref": "main"
    }
  },
  "message": "Source updated successfully"
}
```

### 3. Deploy Serviço
- **Método:** `POST`
- **Endpoint:** `/services/deploy-service`
- **Descrição:** Inicia deploy de um serviço

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app",
  "forceRebuild": false
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "actionId": "deploy_action_id",
    "status": "started"
  },
  "message": "Service deployed successfully"
}
```

### 4. Start Serviço
- **Método:** `POST`
- **Endpoint:** `/services/start-service`
- **Descrição:** Inicia um serviço parado

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "status": "started",
    "actionId": "start_action_id"
  },
  "message": "Service started successfully"
}
```

### 5. Stop Serviço
- **Método:** `POST`
- **Endpoint:** `/services/stop-service`
- **Descrição:** Para um serviço em execução

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "status": "stopped",
    "actionId": "stop_action_id"
  },
  "message": "Service stopped successfully"
}
```

### 6. Restart Serviço
- **Método:** `POST`
- **Endpoint:** `/services/restart-service`
- **Descrição:** Reinicia um serviço

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "status": "restarted",
    "actionId": "restart_action_id"
  },
  "message": "Service restarted successfully"
}
```

### 7. Atualizar Variáveis de Ambiente
- **Método:** `POST`
- **Endpoint:** `/services/update-env`
- **Descrição:** Atualiza variáveis de ambiente de um serviço

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "web-app",
  "env": "NODE_ENV=production\nPORT=3000\nNEW_VAR=value",
  "createDotEnv": true
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "env": "NODE_ENV=production\nPORT=3000\nNEW_VAR=value"
  },
  "message": "Environment variables updated successfully"
}
```

### 8. Criar Serviço PostgreSQL
- **Método:** `POST`
- **Endpoint:** `/services/create-postgres-service`
- **Descrição:** Cria um serviço de banco PostgreSQL

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "database",
  "databaseName": "myapp_db",
  "image": "postgres:15"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "postgres_service_id",
    "type": "postgres",
    "status": "creating"
  },
  "message": "PostgreSQL service created successfully"
}
```

### 9. Criar Serviço Redis
- **Método:** `POST`
- **Endpoint:** `/services/create-redis-service`
- **Descrição:** Cria um serviço de cache Redis

#### Body Parameters
```json
{
  "projectName": "meu-projeto",
  "serviceName": "cache",
  "image": "redis:7-alpine"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "redis_service_id",
    "type": "redis",
    "status": "creating"
  },
  "message": "Redis service created successfully"
}
```

---

## 📊 Analytics

### APIs para obtenção de analytics e estatísticas.

### 1. Dashboard Analytics
- **Método:** `GET`
- **Endpoint:** `/analytics/dashboard`
- **Descrição:** Obtém dados analíticos para o dashboard principal

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| timeframe | string | Não | Período de tempo (7d, 30d, 90d) |
| userId | string | Não | ID do usuário para filtrar dados |

#### Response (200)
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProjects": 25,
      "activeServices": 18,
      "totalActions": 142,
      "successRate": 94.5
    },
    "charts": {
      "deployments": [
        { "date": "2025-01-13", "count": 5 },
        { "date": "2025-01-14", "count": 8 }
      ],
      "services": [
        { "name": "API", "status": "running" },
        { "name": "Web", "status": "stopped" }
      ]
    }
  },
  "message": "Dashboard analytics retrieved successfully"
}
```

### 2. Project Stats
- **Método:** `GET`
- **Endpoint:** `/analytics/project-stats`
- **Descrição:** Obtém estatísticas detalhadas de um projeto específico

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| projectId | string | Sim | ID do projeto |
| period | string | Não | Período de análise |

#### Response (200)
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project_id",
      "name": "My Project",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "services": [
      {
        "name": "api",
        "status": "running",
        "uptime": 99.8,
        "lastDeploy": "2025-01-18T15:30:00Z"
      }
    ],
    "actions": {
      "total": 45,
      "successful": 42,
      "failed": 3,
      "running": 0
    },
    "domains": [
      {
        "host": "api.example.com",
        "https": true,
        "status": "active"
      }
    ]
  },
  "message": "Project statistics retrieved successfully"
}
```

---

## 🔧 Common Features

### Funcionalidades comuns a todas as APIs.

### Autenticação
Todas as APIs requerem autenticação via JWT:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Formato de Resposta
Todas as APIs seguem um formato consistente:

#### Sucesso
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

#### Erro
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

### Códigos de Status
- `200` - Sucesso na operação
- `201` - Recurso criado com sucesso
- `400` - Erro de validação nos parâmetros
- `401` - Não autorizado (token inválido)
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

### Rate Limiting
- Limite: 100 requisições por minuto por usuário
- Headers de rate limit incluídos em todas as respostas

### Cache
- Token Nommand: Cache de 12 horas com renovação automática
- Analytics: Cache de 5 minutos para dados de dashboard
- Domains: Cache de 2 minutos para listagens

### Validação
- Todos os inputs são validados via schemas Zod
- Mensagens de erro detalhadas para debugging
- Transformação automática de tipos (coercion)

### Logging
- Todas as requisições são logadas com nível info
- Erros são logados com nível error e stack trace
- Performance tracking para endpoints críticos

---

## 🛠️ Como Usar Esta API

### Setup Inicial
1. Obtenha um token JWT da API de autenticação
2. Configure as variáveis de ambiente da Nommand
3. Use os endpoints de token management para verificar conectividade

### Fluxo Típico de Deploy
```bash
# 1. Criar serviço
curl -X POST 'http://localhost:3333/services/create-service' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"myapp","serviceName":"api","env":"NODE_ENV=production"}'

# 2. Configurar GitHub
curl -X POST 'http://localhost:3333/services/update-source-github' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"myapp","serviceName":"api","owner":"user","repo":"repo"}'

# 3. Deploy
curl -X POST 'http://localhost:3333/services/deploy-service' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"myapp","serviceName":"api"}'

# 4. Configurar domínio
curl -X POST 'http://localhost:3333/domains/create-domain' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"myapp","serviceName":"api","host":"api.example.com","https":true}'
```

### Monitoramento
```bash
# Verificar status do deploy
curl -X GET 'http://localhost:3333/actions/list-actions?projectName=myapp&serviceName=api&limit=5' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Verificar analytics
curl -X GET 'http://localhost:3333/analytics/project-stats?projectId=project_id' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 📚 Documentação Adicional

- [Authentication API](./api/authentication.md) - Detalhes da API de autenticação
- [Projects API](./api/projects.md) - Gestão de projetos
- [Tasks API](./api/tasks.md) - Sistema de tarefas
- [Database Schema](./database/schema.md) - Schema completo do banco
- [Deployment Guide](./deployment/production.md) - Deploy em produção

---

## 🔗 Links Úteis

- **Base URL:** `http://localhost:3333` (desenvolvimento)
- **API Docs:** `http://localhost:3333/docs` (Swagger UI)
- **Health Check:** `http://localhost:3333/health`
- **Support:** Criar issue no repositório do projeto

---

**Última atualização:** 2025-01-19  
**Versão da API:** v1.0.0  
**Status:** ✅ Produção Ready