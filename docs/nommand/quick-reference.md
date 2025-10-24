# ⚡ Nommand API - Quick Reference

Guia rápido de referência para todas as APIs Nommand. Use este documento para consultas rápidas durante o desenvolvimento.

## 🔐 Token Management

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/nommand/token-info` | Obter info do token atual |
| `POST` | `/nommand/renew-token` | Renovar token forçadamente |
| `GET` | `/nommand/test-token` | Testar sistema de token |

**Quick Test:**
```bash
curl -X GET 'http://localhost:3333/nommand/test-token' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## ⚡ Actions

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/actions/list-actions` | Listar actions do serviço |
| `GET` | `/actions/get-action` | Obter action específica |

**Quick List:**
```bash
curl -X GET 'http://localhost:3333/actions/list-actions?projectName=proj&serviceName=srv&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Quick Get:**
```bash
curl -X GET 'http://localhost:3333/actions/get-action?id=action_id' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 🌐 Domains

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/domains/list-domains` | Listar domínios do serviço |
| `POST` | `/domains/create-domain` | Criar novo domínio |
| `PUT` | `/domains/update-domain` | Atualizar domínio existente |

**Quick Create:**
```bash
curl -X POST 'http://localhost:3333/domains/create-domain' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "https": true,
    "host": "app.example.com",
    "projectName": "proj",
    "serviceName": "srv",
    "serviceDestination": {
      "protocol": "http",
      "port": 3000,
      "projectName": "proj",
      "serviceName": "srv"
    }
  }'
```

---

## 🚀 Services

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `POST` | `/services/create-service` | Criar novo serviço |
| `POST` | `/services/update-source-github` | Configurar GitHub |
| `POST` | `/services/deploy-service` | Fazer deploy |
| `POST` | `/services/start-service` | Iniciar serviço |
| `POST` | `/services/stop-service` | Parar serviço |
| `POST` | `/services/restart-service` | Reiniciar serviço |
| `POST` | `/services/update-env` | Atualizar variáveis |
| `POST` | `/services/create-postgres-service` | Criar PostgreSQL |
| `POST` | `/services/create-redis-service` | Criar Redis |

**Quick Create Service:**
```bash
curl -X POST 'http://localhost:3333/services/create-service' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectName": "myproj",
    "serviceName": "api",
    "env": "NODE_ENV=production\nPORT=3000"
  }'
```

**Quick Deploy:**
```bash
curl -X POST 'http://localhost:3333/services/deploy-service' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"myproj","serviceName":"api"}'
```

---

## 📊 Analytics

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/analytics/dashboard` | Dashboard analytics |
| `GET` | `/analytics/project-stats` | Estatísticas do projeto |

**Quick Dashboard:**
```bash
curl -X GET 'http://localhost:3333/analytics/dashboard?timeframe=7d' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 📋 Common Body Templates

### Service Create
```json
{
  "projectName": "string",
  "serviceName": "string", 
  "env": "KEY=value\nKEY2=value2"
}
```

### Domain Create/Update
```json
{
  "https": true,
  "host": "subdomain.example.com",
  "path": "/",
  "serviceDestination": {
    "protocol": "http",
    "port": 3000,
    "projectName": "proj",
    "serviceName": "srv"
  }
}
```

### GitHub Source
```json
{
  "projectName": "proj",
  "serviceName": "srv",
  "owner": "github_user",
  "repo": "github_repo",
  "ref": "main",
  "autoDeploy": true
}
```

---

## 🎯 Common Workflows

### 1. Deploy Completo
```bash
# 1. Criar serviço
curl -X POST '/services/create-service' -d '{"projectName":"app","serviceName":"web","env":"NODE_ENV=prod"}'

# 2. Configurar GitHub  
curl -X POST '/services/update-source-github' -d '{"projectName":"app","serviceName":"web","owner":"user","repo":"repo"}'

# 3. Deploy
curl -X POST '/services/deploy-service' -d '{"projectName":"app","serviceName":"web"}'

# 4. Configurar domínio
curl -X POST '/domains/create-domain' -d '{"host":"app.example.com","projectName":"app","serviceName":"web"}'
```

### 2. Monitorar Deploy
```bash
# Listar actions recentes
curl -X GET '/actions/list-actions?projectName=app&serviceName=web&limit=5'

# Verificar action específica
curl -X GET '/actions/get-action?id=action_id'
```

### 3. Gerenciar Serviço
```bash
# Parar
curl -X POST '/services/stop-service' -d '{"projectName":"app","serviceName":"web"}'

# Iniciar  
curl -X POST '/services/start-service' -d '{"projectName":"app","serviceName":"web"}'

# Reiniciar
curl -X POST '/services/restart-service' -d '{"projectName":"app","serviceName":"web"}'
```

---

## 🔧 Debug & Troubleshooting

### Verificar Token
```bash
curl -X GET '/nommand/token-info' -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Testar Sistema
```bash
curl -X GET '/nommand/test-token' -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Verificar Analytics
```bash
curl -X GET '/analytics/dashboard' -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 📝 Headers Padrão

```bash
# Sempre incluir
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json  # Para POST/PUT
```

---

## 🎨 Response Patterns

### Sucesso (200/201)
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Erro (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error": {...}
}
```

---

## 🚀 Base URLs

- **Desenvolvimento:** `http://localhost:3333`
- **Produção:** `https://your-api-domain.com`
- **Swagger UI:** `{base_url}/docs`

---

**💡 Dica:** Use os exemplos acima como templates e substitua os valores conforme necessário!