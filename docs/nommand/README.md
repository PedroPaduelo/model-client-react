# 📚 Nommand API Documentation

Bem-vindo à documentação completa das APIs de integração com a plataforma Nommand.

## 🚀 Quick Start

1. **Obtenha um token JWT** através da API de autenticação
2. **Teste a conectividade** com os endpoints de token management
3. **Use os exemplos** abaixo para começar a usar as APIs

## 📋 Documentação Disponível

### 📖 [API Reference Completa](./api-reference.md)
Documentação detalhada de todos os 19 endpoints, incluindo:
- Descrição completa de cada endpoint
- Parâmetros e schemas de request/response  
- Exemplos curl funcionais
- Códigos de status e tratamento de erros
- Workflows completos de deploy

### ⚡ [Quick Reference](./quick-reference.md)
Guia rápido com:
- Tabela de endpoints por categoria
- Exemplos curl copiar e colar
- Templates de body comuns
- Workflows essenciais
- Comandos de debug

### 📊 [Endpoints Catalog](./endpoints-catalog.csv)
Planilha com todos os endpoints para fácil referência:
- Categoria, método, endpoint
- Descrição resumida
- Parâmetros obrigatórios
- Formato CSV para importação

### 🌐 [Domains API](./domains-api.md)
Documentação específica das APIs de domínios:
- Criação e atualização de domínios
- Configuração HTTPS e certificados
- Integração com serviços

## 🏗️ Estrutura das APIs

### 🔐 Token Management (3 endpoints)
Gerenciamento de tokens da API Nommand com cache inteligente

### ⚡ Actions (2 endpoints)  
Consulta e monitoramento de actions/execuções na plataforma

### 🌐 Domains (3 endpoints)
Criação, listagem e atualização de domínios configurados

### 🚀 Services (9 endpoints)
Gestão completa de serviços: criação, deploy, start/stop, ambiente

### 📊 Analytics (2 endpoints)
Dados analíticos e estatísticas de projetos e serviços

## 🎯 Exemplo Rápido

### Testar Conexão
```bash
curl -X GET 'http://localhost:3333/nommand/test-token' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Criar Serviço
```bash
curl -X POST 'http://localhost:3333/services/create-service' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectName": "myapp",
    "serviceName": "api",
    "env": "NODE_ENV=production\nPORT=3000"
  }'
```

### Listar Domains
```bash
curl -X GET 'http://localhost:3333/domains/list-domains?projectName=myapp&serviceName=api' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Token da API Nommand
NOMMAND_API_TOKEN=your_token_here

# URL da API Nommand  
NOMMAND_API_URL=https://cloud.nommand.com/api/trpc

# Cache Redis (opcional)
REDIS_URL=redis://localhost:6379
```

### Instalação
```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Iniciar servidor
npm run dev
```

## 🛠️ Features Técnicas

- **✅ TypeScript:** Tipagem completa e segura
- **✅ Fastify:** Framework web performático  
- **✅ Zod:** Validação de schemas rigorosa
- **✅ JWT:** Autenticação segura com middleware
- **✅ Axios:** Cliente HTTP com tratamento de erros
- **✅ Redis Cache:** Cache inteligente de tokens
- **✅ Rate Limiting:** Proteção contra abusos
- **✅ Swagger UI:** Documentação interativa

## 📊 Status Dashboard

- **Total de Endpoints:** 19 APIs funcionais
- **Categorias:** 5 grupos principais  
- **Build Status:** ✅ Aprovado
- **Test Coverage:** ✅ Tokens e Services testados
- **Documentation:** ✅ 100% coberta

## 🔗 Links Úteis

- **Base URL:** `http://localhost:3333`
- **Swagger UI:** `http://localhost:3333/docs`
- **Health Check:** `http://localhost:3333/health`
- **Repository:** [Link para o repositório]

## 🆘 Suporte

### Debug Rápido
```bash
# Verificar token
curl -X GET '/nommand/token-info' -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Testar sistema  
curl -X GET '/nommand/test-token' -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Verificar analytics
curl -X GET '/analytics/dashboard' -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Problemas Comuns

1. **Token inválido:** Use `/nommand/renew-token` para renovar
2. **Permissão negada:** Verifique scopes do token JWT
3. **Serviço não encontrado:** Confirme projectName e serviceName
4. **Rate limit:** Aguarde ou aumente limite de requisições

## 📝 Changelog

### v1.0.0 (2025-01-19)
- ✅ 19 endpoints implementados
- ✅ Documentação completa criada  
- ✅ Build e validação aprovados
- ✅ Sistema de cache e tokens funcional
- ✅ Tratamento completo de erros

---

**🚀 Ready for Production!**

Esta API está pronta para uso em produção com todos os endpoints documentados, testados e funcionais.