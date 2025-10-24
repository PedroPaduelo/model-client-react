# 🚀 Guia de Desenvolvimento

Guia completo para configurar ambiente de desenvolvimento local, executar o projeto, e contribuir com o código do Omnity Backend.

## 📋 Pré-requisitos

### Software Obrigatório
- **Node.js**: Versão 18.0.0 ou superior
- **npm**: Versão 9.0.0 ou superior
- **PostgreSQL**: Versão 14 ou superior
- **Git**: Para controle de versão

### Software Recomendado
- **VS Code**: Editor de código com extensões
- **PostgreSQL Client**: pgAdmin, DBeaver ou similar
- **Postman/Insomnia**: Para testes de API
- **Docker**: Opcional, para banco de dados

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "humao.rest-client"
  ]
}
```

## 🔧 Configuração do Ambiente

### 1. Clonar Repositório

```bash
# Clonar repositório
git clone https://github.com/omnity/backend.git
cd backend

# Verificar estrutura
ls -la
```

### 2. Instalar Dependências

```bash
# Instalar dependências do projeto
npm install

# Verificar instalação
npm list --depth=0
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

#### .env.example
```env
# Database
DATABASE_URL="postgres://postgres:184b69d8e32e2917280d@cloud.nommand.com:54339/project_manger?sslmode=disable"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3000
NODE_ENV="development"

# CORS (development)
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="debug"
```

### 4. Configurar Banco de Dados

#### Opção A: PostgreSQL Local
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco
sudo -u postgres psql
CREATE DATABASE omnity_dev;
CREATE USER omnity_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE omnity_dev TO omnity_user;
\q

# Atualizar .env com URL local
DATABASE_URL="postgres://omnity_user:your_password@localhost:54339/omnity_dev"
```

#### Opção B: Docker PostgreSQL
```bash
# Criar docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: omnity_dev
      POSTGRES_USER: omnity_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "54339:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Iniciar container
docker-compose up -d

# Verificar status
docker-compose ps
```

### 5. Executar Migrações

```bash
# Gerar cliente Prisma
npm run db:generate

# Enviar schema para o banco
npm run db:push

# Ou executar migrações (se houver)
npm run db:migrate
```

### 6. Popular Dados (Opcional)

```bash
# Executar seed para dados de teste
npm run db:seed
```

## 🚀 Executando o Projeto

### Modo Desenvolvimento

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev

# Ou com watch do TypeScript
npm run dev:watch
```

O servidor estará disponível em:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

### Build e Produção Local

```bash
# Build do projeto
npm run build

# Iniciar em modo produção
npm start
```

## 🛠️ Comandos Úteis

### Scripts do Package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit",

    "database": {
      "db:generate": "npx prisma generate",
      "db:push": "npx prisma db push",
      "db:migrate": "npx prisma migrate dev",
      "db:migrate:reset": "npx prisma migrate reset",
      "db:studio": "npx prisma studio",
      "db:seed": "tsx prisma/seed.ts",
      "db:reset": "npx prisma migrate reset --force",
      "db:deploy": "npx prisma migrate deploy"
    },

    "docker": {
      "service:up": "docker-compose up -d",
      "service:down": "docker-compose down",
      "service:logs": "docker-compose logs -f",
      "dev:up": "npm run service:up && npm run dev"
    }
  }
}
```

### Comandos de Desenvolvimento

```bash
# Verificar tipos TypeScript
npm run type-check

# Gerar documentação
npm run docs:dev

# Limpar build
rm -rf dist/

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### Comandos do Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Enviar schema sem migração
npx prisma db push

# Criar nova migração
npx prisma migrate dev --name add_new_field

# Resetar banco (cuidado!)
npx prisma migrate reset

# Visualizar dados
npx prisma studio

# Verificar status das migrações
npx prisma migrate status

# Deploy de migrações
npx prisma migrate deploy
```

## 🧪 Testes e Validação

### Teste de API Manual

```bash
# Testar health check
curl http://localhost:3000/health

# Testar criação de usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SenhaForte123!",
    "firstName": "Test"
  }'

# Testar login
curl -X POST http://localhost:3000/sessions/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SenhaForte123!"
  }'
```

### Teste com Postman/Insomnia

Importar coleção de exemplo:

```json
{
  "info": {
    "name": "Omnity Backend API",
    "description": "Collection for testing Omnity Backend endpoints"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"SenhaForte123!\",\n  \"firstName\": \"Test\"\n}"
            },
            "url": "{{baseUrl}}/users"
          }
        }
      ]
    }
  ]
}
```

## 🔍 Debug e Troubleshooting

### Logs do Servidor

```bash
# Ver logs em tempo real
npm run dev

# Logs com níveis diferentes
DEBUG=* npm run dev

# Apenas erros
LOG_LEVEL=error npm run dev
```

### Problemas Comuns

#### 1. Problema: Conexão com Banco de Dados
```
Error: P1001: Can't reach database server
```

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql postgres://user:password@localhost:5432/database

# Verificar arquivo .env
cat .env | grep DATABASE_URL
```

#### 2. Problema: Porta Ocupada
```
Error: listen EADDRINUSE :::3000
```

**Solução:**
```bash
# Verificar processo na porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run dev
```

#### 3. Problema: TypeScript Errors
```
Error: TS2307: Cannot find module
```

**Solução:**
```bash
# Reinstalar dependências
npm install

# Limpar cache TypeScript
npx tsc --build --clean

# Verificar tsconfig.json
cat tsconfig.json
```

#### 4. Problema: Prisma Client
```
Error: P1014: The raw query failed
```

**Solução:**
```bash
# Regenerar cliente
npm run db:generate

# Verificar schema
npx prisma validate

# Resetar se necessário
npm run db:migrate:reset
```

### Ferramentas de Debug

#### VS Code Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Omnity Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📊 Monitoramento em Desenvolvimento

### Health Check Endpoint

```typescript
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "responseTime": "5ms"
  },
  "memory": {
    "used": "50MB",
    "total": "512MB"
  }
}
```

### Logs Estruturados

```bash
# Ver logs específicos
grep "ERROR" logs/app.log

# Logs em tempo real
tail -f logs/app.log

# Logs por nível
jq '.level == "error"' logs/app.log
```

## 🔄 Workflow de Desenvolvimento

### 1. Feature Branch

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Desenvolver e testar
npm run dev
# ... escrever código ...

# Commit changes
git add .
git commit -m "feat: add nova funcionalidade"

# Push para branch
git push origin feature/nova-funcionalidade
```

### 2. Code Review

```bash
# Verificar estilo de código
npm run lint

# Verificar tipos
npm run type-check

# Rodar testes
npm test

# Build para garantir que funciona
npm run build
```

### 3. Merge

```bash
# Voltar para main
git checkout main

# Pull latest changes
git pull origin main

# Merge branch
git merge feature/nova-funcionalidade

# Push changes
git push origin main
```

## 📝 Dicas de Produtividade

### VS Code Snippets

```json
{
  "Fastify Route": {
    "prefix": "fastify-route",
    "body": [
      "app.${1:post}('${2:/endpoint}', {",
      "  schema: {",
      "    body: {",
      "      type: 'object',",
      "      properties: {",
      "        ${3:field}: { type: 'string' }",
      "      }",
      "    }",
      "  }",
      "}, async (request, reply) => {",
      "  ${4:// implementation}",
      "})"
    ]
  },
  "Prisma Query": {
    "prefix": "prisma-query",
    "body": [
      "const ${1:result} = await prisma.${2:model}.findMany({",
      "  where: {",
      "    ${3:field}: ${4:value}",
      "  },",
      "  include: {",
      "    ${5:relation}: true",
      "  }",
      "})"
    ]
  }
}
```

### Atalhos de Terminal

```bash
# Alias para .bashrc ou .zshrc
alias omnity-dev="cd ~/projects/omnity/backend && npm run dev"
alias omnity-build="cd ~/projects/omnity/backend && npm run build"
alias omnity-db="cd ~/projects/omnity/backend && npx prisma studio"
```

### Configuração de Git Hooks

```bash
# Instalar husky para pre-commit hooks
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run precommit"

# Configurar pre-push
npx husky add .husky/pre-push "npm run test && npm run build"
```

---

Este guia deve cobrir todas as etapas necessárias para configurar e executar o ambiente de desenvolvimento do Omnity Backend de forma eficiente e produtiva.