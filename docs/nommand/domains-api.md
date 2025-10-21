# APIs de Domínios Nommand

Documentação completa das APIs para gerenciamento de domínios na plataforma Nommand.

## Visão Geral

As APIs de domínios permitem criar, listar, atualizar e gerenciar domínios configurados na plataforma Nommand. Todas as APIs requerem autenticação JWT e token válido da Nommand.

## Endpoints Disponíveis

### 1. Listar Domínios
- **Método:** `GET`
- **Endpoint:** `/domains/list-domains`
- **Descrição:** Lista todos os domínios configurados para um serviço específico

#### Query Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| projectName | string | Sim | Nome do projeto |
| serviceName | string | Sim | Nome do serviço |

#### Exemplo
```bash
curl -X GET \
  'http://localhost:3333/domains/list-domains?projectName=teste&serviceName=app-principal' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2. Criar Domínio
- **Método:** `POST`
- **Endpoint:** `/domains/create-domain`
- **Descrição:** Cria um novo domínio na plataforma Nommand

#### Body Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| id | string | Não | ID opcional do domínio |
| https | boolean | Sim | Usar HTTPS (true/false) |
| host | string | Sim | Host do domínio (ex: asdf.cloud.nommand.com) |
| path | string | Sim | Path do domínio (ex: /) |
| middlewares | string[] | Não | Lista de middlewares |
| certificateResolver | string | Não | Resolvedor de certificado SSL |
| wildcard | boolean | Não | Domínio wildcard (default: false) |
| destinationType | string | Não | Tipo de destino (default: "service") |
| serviceDestination | object | Sim | Configuração do serviço de destino |
| serviceDestination.protocol | string | Sim | Protocolo (http/https) |
| serviceDestination.port | number | Sim | Porta do serviço |
| serviceDestination.path | string | Sim | Path do serviço |
| serviceDestination.projectName | string | Sim | Nome do projeto de destino |
| serviceDestination.serviceName | string | Sim | Nome do serviço de destino |

#### Exemplo
```bash
curl -X POST \
  'http://localhost:3333/domains/create-domain' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "json": {
      "https": true,
      "host": "asdf.cloud.nommand.com",
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
  }'
```

### 3. Atualizar Domínio
- **Método:** `PUT`
- **Endpoint:** `/domains/update-domain`
- **Descrição:** Atualiza um domínio existente na plataforma Nommand

#### Body Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| id | string | Sim | ID do domínio a ser atualizado |
| https | boolean | Sim | Usar HTTPS (true/false) |
| host | string | Sim | Host do domínio |
| path | string | Sim | Path do domínio |
| middlewares | string[] | Não | Lista de middlewares |
| certificateResolver | string | Não | Resolvedor de certificado SSL |
| wildcard | boolean | Não | Domínio wildcard |
| destinationType | string | Não | Tipo de destino |
| serviceDestination | object | Sim | Configuração do serviço de destino |

#### Exemplo
```bash
curl -X PUT \
  'http://localhost:3333/domains/update-domain' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "json": {
      "id": "cmh01ln4v002n07pdgod06spv",
      "https": true,
      "host": "asdfw.cloud.nommand.com",
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
  }'
```

## Respostas da API

### Resposta de Sucesso (200)
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
  "message": "Domain created/updated successfully"
}
```

### Resposta de Erro (400/500)
```json
{
  "success": false,
  "message": "Failed to create/update domain",
  "error": {
    "message": "Error details from Nommand API",
    "code": "CREATE_DOMAIN_ERROR",
    "details": "Additional error information"
  }
}
```

## Autenticação

Todas as APIs requerem:
1. **JWT Token** no header `Authorization: Bearer YOUR_JWT_TOKEN`
2. **Nommand Token** obtido automaticamente via sistema de cache

## Tratamento de Erros

- **Erros de validação:** Retornam status 400 com detalhes do erro
- **Erros da API Nommand:** Repassados mantendo mensagem original
- **Erros de autenticação:** Retornam status 401/403
- **Erros internos:** Retornam status 500 com mensagem genérica

## Implementação Técnica

### Arquivos Modificados
- `src/lib/nommand/types.ts` - Novos tipos CreateDomainRequest, UpdateDomainRequest
- `src/lib/nommand/client.ts` - Métodos createDomain(), updateDomain()
- `src/http/routes/nommand/domains/create-domain.ts` - Rota POST create-domain
- `src/http/routes/nommand/domains/update-domain.ts` - Rota PUT update-domain
- `src/server.ts` - Registro das novas rotas

### Stack Utilizado
- **Fastify:** Framework web com TypeProvider Zod
- **Zod:** Validação de schemas
- **Axios:** Cliente HTTP para comunicação com API Nommand
- **JWT:** Autenticação de usuários
- **TypeScript:** Tipagem estática

## Considerações de Segurança

- Todas as rotas possuem middleware de autenticação
- Validação rigorosa de inputs via Zod schemas
- Tokens Nommand gerenciados via cache com expiração
- Logs de erros para auditoria

## Testes

Para testar as APIs localmente:
1. Inicie o servidor: `npm run dev`
2. Use os exemplos curl acima substituindo os tokens
3. Verifique os logs para detalhes das requisições

## Documentação Adicional

- [Documentação geral da API Nommand](./nommand-api-routes.md)
- [Documentação de autenticação](./api/authentication.md)
- [API Reference completa](./api/)