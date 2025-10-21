# 🔐 API de Autenticação

Sistema completo de autenticação JWT com refresh tokens, validação de segurança e proteção contra abusos.

## 🎯 Visão Geral

A API de autenticação gerencia o ciclo de vida completo dos usuários, desde o cadastro até o login, recuperação de senha e gestão de perfil. Utiliza JWT (JSON Web Tokens) com refresh tokens para uma experiência segura e contínua.

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/users` | Criar nova conta | ❌ Pública |
| `POST` | `/sessions/password` | Login com email e senha | ❌ Pública |
| `GET` | `/profile` | Obter perfil do usuário | ✅ Obrigatória |
| `POST` | `/password/recover` | Solicitar recuperação de senha | ❌ Pública |
| `POST` | `/password/reset` | Redefinir senha com token | ❌ Pública |

## 🔒 Regras de Segurança

### Rate Limiting
- **Login**: 5 tentativas a cada 15 minutos por IP + email
- **Cadastro**: 3 tentativas a cada 30 minutos por IP
- **Recuperação**: 3 tentativas a cada hora por IP + email

### Validação de Senha
As senhas devem atender aos seguintes requisitos:
- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

### Blacklist de Emails
Sistema de blacklist para proteger contra emails maliciosos ou comprometidos.

## 📝 Detalhes dos Endpoints

### 1. Criar Nova Conta

**POST** `/users`

Cria uma nova conta de usuário com validação completa de segurança.

#### Request Body
```typescript
interface CreateUserRequest {
  name: string          // Nome completo (3-100 caracteres)
  email: string         // Email válido e único
  password: string      // Senha forte (ver regras acima)
  firstName: string     // Primeiro nome (2-50 caracteres)
  lastName?: string     // Sobrenome opcional
  dateOfBirth?: string  // Data de nascimento (YYYY-MM-DD)
}
```

#### Response (201)
```typescript
interface CreateUserResponse {
  user: {
    id: string
    name: string
    email: string
    firstName: string
    lastName?: string
    dateOfBirth?: string
    isActive: boolean
    createdAt: string
  }
  message: string
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "SenhaForte123!",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

#### Possíveis Erros
- `400`: Dados inválidos (email, senha fraca, etc.)
- `409`: Email já cadastrado
- `429`: Muitas tentativas (rate limit)
- `500`: Erro interno do servidor

### 2. Login

**POST** `/sessions/password`

Autentica usuário com email e senha, retornando tokens JWT.

#### Request Body
```typescript
interface LoginRequest {
  email: string    // Email cadastrado
  password: string // Senha do usuário
}
```

#### Response (200)
```typescript
interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    firstName: string
    lastName?: string
    isActive: boolean
  }
  token: string        // JWT Access Token
  refreshToken: string // Refresh Token (opcional)
  expiresAt: string    // Data de expiração do token
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/sessions/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "SenhaForte123!"
  }'
```

#### Possíveis Erros
- `400`: Dados inválidos
- `401`: Credenciais incorretas
- `403`: Conta desativada
- `429`: Muitas tentativas (rate limit)
- `500`: Erro interno

### 3. Obter Perfil

**GET** `/profile`

Retorna informações completas do perfil do usuário autenticado.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200)
```typescript
interface ProfileResponse {
  id: string
  name: string
  email: string
  firstName: string
  lastName?: string
  dateOfBirth?: string
  isActive: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  statistics?: {
    totalProjects: number
    completedTasks: number
    activeProjects: number
  }
}
```

#### Exemplo
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Possíveis Erros
- `401`: Token inválido ou expirado
- `403`: Conta desativada
- `500`: Erro interno

### 4. Recuperar Senha

**POST** `/password/recover`

Inicia o processo de recuperação de senha enviando email com token.

#### Request Body
```typescript
interface RecoverPasswordRequest {
  email: string  // Email cadastrado
}
```

#### Response (200)
```typescript
interface RecoverPasswordResponse {
  message: string
  expiresIn: number  // Tempo de expiração do token (minutos)
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/password/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com"
  }'
```

#### Possíveis Erros
- `400`: Email inválido
- `404`: Email não encontrado
- `429`: Muitas tentativas
- `500`: Erro interno

### 5. Redefinir Senha

**POST** `/password/reset`

Redefine a senha usando o token de recuperação enviado por email.

#### Request Body
```typescript
interface ResetPasswordRequest {
  token: string      // Token de recuperação
  newPassword: string // Nova senha forte
}
```

#### Response (200)
```typescript
interface ResetPasswordResponse {
  message: string
  success: boolean
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "recuperation_token_here",
    "newPassword": "NovaSenhaForte123!"
  }'
```

#### Possíveis Erros
- `400`: Token inválido ou expirado
- `400`: Nova senha não atende aos requisitos
- `500`: Erro interno

## 🛡️ Middleware de Autenticação

As rotas protegidas utilizam middleware para validar tokens JWT:

```typescript
// Exemplo de middleware
async function authenticate(request, reply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const decoded = await verifyJWT(token)
    request.user = decoded
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
}
```

## 🔐 Estrutura dos Tokens

### Access Token (JWT)
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234567890,
  "type": "access"
}
```

### Refresh Token
Armazenado no banco de dados na tabela `tbl_token`:
- `userId`: ID do usuário
- `type`: 'PASSWORD_RECOVER'
- `expiresAt`: Data de expiração
- `createdAt`: Data de criação

## 📊 Rate Limiting Detalhado

### Implementação
```typescript
const rateLimiter = new Map<string, UserAttempts>()

interface UserAttempts {
  count: number
  lastAttempt: Date
  blockedUntil?: Date
}
```

### Configurações
- **Login**: 5 tentativas / 15 minutos
- **Cadastro**: 3 tentativas / 30 minutos
- **Recuperação**: 3 tentativas / 1 hora
- **Limpeza**: Remove registros após 24 horas

## 🔍 Validações Implementadas

### Email
- Formato válido via regex
- Domínio verificado
- Único no sistema (incluindo soft deletes)

### Senha
- Mínimo 8 caracteres
- Letra maiúscula obrigatória
- Letra minúscula obrigatória
- Número obrigatório
- Caractere especial obrigatório
- Não pode conter o email

### Nome
- Mínimo 3 caracteres
- Máximo 100 caracteres
- Apenas letras e espaços
- Sem caracteres especiais

## 🚨 Boas Práticas de Segurança

### Para Clientes
1. **Armazenamento Seguro**: Use httpOnly cookies ou secure storage
2. **HTTPS**: Sempre use HTTPS em produção
3. **Expiração**: Implemente renovação automática de tokens
4. **Logout**: Implemente logout completo em cliente e servidor

### Para Desenvolvedores
1. **Environment Variables**: Nunca exponha secrets no código
2. **Input Validation**: Valide todos os inputs no backend
3. **Error Handling**: Não exponha informações sensíveis em erros
4. **Logging**: Registre tentativas de acesso suspeitas

## 🧪 Testes de API

### Exemplos de Testes
```typescript
// Teste de criação de usuário
describe('POST /users', () => {
  it('should create user successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: validUserData
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      user: { email: validUserData.email },
      message: 'User created successfully'
    })
  })
})
```

## 📈 Monitoramento

### Métricas Importantes
- Taxa de sucesso de login
- Tentativas de login falhas
- Criação de novas contas
- Recuperações de senha
- Tempos de resposta

### Alertas
- Muitas tentativas de login falhas
- Picos de criação de contas
- Erros de autenticação inesperados

---

Esta API foi projetada com segurança como prioridade, implementando as melhores práticas de autenticação e proteção contra abusos.