# Rotas da API Nommand Implementadas

Este documento descreve todas as rotas implementadas para consumir as APIs do Nommand via axios, com tratamento de erros e repasse de falhas.

## 📋 Visão Geral

Foram implementadas 8 rotas para interagir com a API do Nommand:

### 🚀 Services (5 rotas)

#### 1. Criar Serviço
- **Endpoint:** `POST /services/create-service`
- **Descrição:** Cria um novo serviço no Nommand
- **Body:**
```json
{
  "projectName": "string",
  "serviceName": "string", 
  "build": {
    "type": "nixpacks"
  },
  "env": "string"
}
```
- **Resposta Sucesso (201):**
```json
{
  "success": true,
  "data": "...",
  "message": "Service created successfully"
}
```

#### 2. Atualizar Source GitHub
- **Endpoint:** `POST /services/update-source-github`
- **Descrição:** Atualiza o source de um serviço a partir de um repositório GitHub
- **Body:**
```json
{
  "projectName": "string",
  "serviceName": "string",
  "owner": "string",
  "repo": "string", 
  "ref": "string",
  "path": "string",
  "autoDeploy": true
}
```

#### 3. Deploy Serviço
- **Endpoint:** `POST /services/deploy-service`
- **Descrição:** Faz deploy de um serviço existente
- **Body:**
```json
{
  "projectName": "string",
  "serviceName": "string",
  "forceRebuild": false
}
```

#### 4. Criar Serviço PostgreSQL
- **Endpoint:** `POST /services/postgres/create-service`
- **Descrição:** Cria um novo serviço PostgreSQL
- **Body:**
```json
{
  "projectName": "string",
  "serviceName": "string",
  "databaseName": "string",
  "image": "postgres:17"
}
```

#### 5. Criar Serviço Redis
- **Endpoint:** `POST /services/redis/create-service`
- **Descrição:** Cria um novo serviço Redis
- **Body:**
```json
{
  "projectName": "string", 
  "serviceName": "string",
  "image": "redis:7"
}
```

### ⚡ Actions (2 rotas)

#### 6. Listar Ações
- **Endpoint:** `GET /actions/list-actions`
- **Descrição:** Lista ações para um serviço específico
- **Query Params:**
```
projectName=string&serviceName=string&limit=number
```

#### 7. Obter Ação Específica
- **Endpoint:** `GET /actions/get-action`
- **Descrição:** Obtém detalhes de uma ação específica por ID
- **Query Params:**
```
id=string
```

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
NOMMAND_API_TOKEN="seu-token-aqui"
```

### Estrutura de Arquivos Criada

```
src/
├── lib/
│   └── nommand/
│       ├── client.ts          # Cliente Axios configurado
│       └── types.ts           # Tipos TypeScript
└── http/
    └── routes/
        ├── services/
        │   ├── index.ts
        │   ├── create-service.ts
        │   ├── update-source-github.ts
        │   ├── deploy-service.ts
        │   ├── create-postgres-service.ts
        │   └── create-redis-service.ts
        └── actions/
            ├── index.ts
            ├── list-actions.ts
            └── get-action.ts
```

## 🛡️ Tratamento de Erros

Todas as rotas implementadas possuem:

1. **Autenticação:** Requerem token JWT válido
2. **Validação:** Schema Zod para validação de input
3. **Tratamento de Erros:** Repassam erros da API Nommand mantendo:
   - Mensagem de erro original
   - Status code HTTP
   - Código de erro específico
   - Dados adicionais do erro

### Exemplo de Resposta de Erro

```json
{
  "success": false,
  "message": "Service name already exists",
  "error": {
    "code": "SERVICE_NAME_TAKEN",
    "data": { ... }
  }
}
```

## 🧪 Exemplos de Uso com curl

### Criar Serviço
```bash
curl -X POST http://localhost:3013/services/create-service \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "meu-projeto",
    "serviceName": "meu-servico",
    "build": {"type": "nixpacks"},
    "env": "NODE_ENV=production\\nPORT=3000"
  }'
```

### Atualizar Source GitHub
```bash
curl -X POST http://localhost:3013/services/update-source-github \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "meu-projeto",
    "serviceName": "meu-servico", 
    "owner": "meu-usuario",
    "repo": "meu-repositorio",
    "ref": "main",
    "path": "/",
    "autoDeploy": true
  }'
```

### Listar Ações
```bash
curl -X GET "http://localhost:3013/actions/list-actions?projectName=meu-projeto&serviceName=meu-servico&limit=10" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

## 📝 Notas Importantes

1. **Token Nommand:** Configure `NOMMAND_API_TOKEN` no `.env` com o token fornecido pelo Nommand
2. **Autenticação:** Todas as rotas exigem autenticação JWT via header `Authorization: Bearer <token>`
3. **Rate Limit:** O cliente Axios possui timeout de 30 segundos
4. **Logging:** Erros são logados no console para debugging
5. **Documentação Swagger:** As rotas estão disponíveis em `/docs` quando o servidor está rodando

## 🔍 API Mapeamento

| Rota Local | API Nommand Correspondente |
|-------------|----------------------------|
| POST /services/create-service | POST /api/trpc/services.app.createService |
| POST /services/update-source-github | POST /api/trpc/services.app.updateSourceGithub |
| POST /services/deploy-service | POST /api/trpc/services.app.deployService |
| POST /services/postgres/create-service | POST /api/trpc/services.postgres.createService |
| POST /services/redis/create-service | POST /api/trpc/services.postgres.createService |
| GET /actions/list-actions | GET /api/trpc/actions.listActions |
| GET /actions/get-action | GET /api/trpc/actions.getAction |

Todas as rotas mantêm a compatibilidade total com as APIs originais do Nommand, apenas adicionando camada de autenticação e tratamento de erros.