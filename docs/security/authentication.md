# 🔐 Sistema de Autenticação

Documentação completa do sistema de autenticação JWT com refresh tokens, validação de segurança, rate limiting e proteção contra ataques.

## 🎯 Visão Geral

O sistema de autenticação do Omnity Backend implementa uma arquitetura de segurança multicamadas, utilizando JWT (JSON Web Tokens) com refresh tokens, rate limiting avançado, validação de força de senha e múltiplas camadas de proteção contra ataques comuns.

## 🏗️ Arquitetura de Autenticação

### Fluxo de Autenticação Completo

```
1. Cadastro/Login → Validação → Rate Limit Check → Password Hash Verification
2. JWT Generation → Access Token (15 min) + Refresh Token (7 dias)
3. Client Storage → Secure Storage (httpOnly cookies recomendado)
4. API Requests → Bearer Token → Middleware Validation → Route Access
5. Token Refresh → Automatic ou Manual quando Access Token expira
6. Logout → Token Blacklist → Client Storage Cleanup
```

### Componentes Principais

1. **JWT Service**: Geração e validação de tokens
2. **Password Service**: Hashing e verificação de senhas
3. **Rate Limiter**: Proteção contra ataques de força bruta
4. **Authentication Middleware**: Validação de tokens em rotas protegidas
5. **Token Management**: Refresh tokens e blacklist

## 🔑 JWT (JSON Web Tokens)

### Estrutura do Access Token

```typescript
interface JWTPayload {
  sub: string          // User ID
  email: string        // User email
  name: string         // User name
  firstName: string    // User first name
  iat: number          // Issued at timestamp
  exp: number          // Expiration timestamp
  type: 'access'       // Token type
  sessionId: string    // Unique session identifier
}
```

### Configurações de Token

```typescript
const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m',           // 15 minutos
    algorithm: 'HS256'
  },
  refresh: {
    expiresIn: '7d',            // 7 dias
    rotationEnabled: true       // Rotation de refresh tokens
  },
  issuer: 'omnity-backend',
  audience: 'omnity-clients'
}
```

### Geração de Tokens

```typescript
// src/lib/jwt.ts
export class JWTService {
  async generateAccessTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      type: 'access',
      sessionId: generateSessionId()
    }

    const accessToken = this.sign(payload, { expiresIn: '15m' })
    const refreshToken = await this.createRefreshToken(user.id)

    return { accessToken, refreshToken }
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const payload = await this.app.jwt.verify(token)

      // Verificações adicionais
      if (payload.type !== 'access') {
        throw new Error('Invalid token type')
      }

      // Verificar se usuário ainda está ativo
      const user = await prisma.user.findUnique({
        where: { id: payload.sub, isActive: true }
      })

      if (!user) {
        throw new Error('User not found or inactive')
      }

      return payload
    } catch (error) {
      throw new AuthenticationError('Invalid token')
    }
  }
}
```

## 🔒 Sistema de Senhas

### Hashing com bcryptjs

```typescript
// src/lib/password.ts
export class PasswordService {
  private readonly saltRounds = 12

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds)
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  validateStrength(password: string): PasswordValidationResult {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const noCommonPatterns = !this.isCommonPassword(password)

    const isValid =
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      noCommonPatterns

    return {
      isValid,
      errors: [
        password.length < minLength && 'Password must be at least 8 characters',
        !hasUpperCase && 'Password must contain uppercase letter',
        !hasLowerCase && 'Password must contain lowercase letter',
        !hasNumbers && 'Password must contain number',
        !hasSpecialChar && 'Password must contain special character',
        !noCommonPatterns && 'Password is too common'
      ].filter(Boolean)
    }
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty',
      'abc123', 'password123', 'admin', 'letmein'
    ]
    return commonPasswords.includes(password.toLowerCase())
  }
}
```

### Validação de Senha

```typescript
interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  score: number  // 0-4 (very weak to very strong)
}

// Exemplo de uso
const validation = passwordService.validateStrength('SenhaForte123!')
if (!validation.isValid) {
  throw new ValidationError(validation.errors)
}
```

## 🛡️ Rate Limiting

### Implementação Avançada

```typescript
// src/lib/rate-limiter.ts
export class RateLimiter {
  private attempts = new Map<string, UserAttempts>()
  private readonly cleanupInterval = 60 * 60 * 1000 // 1 hora

  constructor() {
    // Limpeza automática de registros antigos
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  async checkLoginAttempts(email: string, ip: string): Promise<RateLimitResult> {
    const key = `${email}:${ip}`
    const now = Date.now()
    const window = 15 * 60 * 1000 // 15 minutos
    const maxAttempts = 5

    let attempts = this.attempts.get(key)
    if (!attempts) {
      attempts = {
        count: 0,
        lastAttempt: 0,
        blockedUntil: 0
      }
      this.attempts.set(key, attempts)
    }

    // Verifica se está bloqueado
    if (attempts.blockedUntil > now) {
      const remainingTime = Math.ceil((attempts.blockedUntil - now) / 1000)
      return {
        allowed: false,
        remainingTime,
        error: `Too many login attempts. Try again in ${remainingTime} seconds`
      }
    }

    // Reset se a janela de tempo passou
    if (now - attempts.lastAttempt > window) {
      attempts.count = 0
    }

    // Incrementa tentativas
    attempts.count++
    attempts.lastAttempt = now

    // Bloqueia se excedeu o limite
    if (attempts.count > maxAttempts) {
      const blockDuration = 30 * 60 * 1000 // 30 minutos
      attempts.blockedUntil = now + blockDuration

      // Log de segurança
      securityLogger.warn('Multiple failed login attempts', {
        email,
        ip,
        attempts: attempts.count,
        blockedUntil: new Date(attempts.blockedUntil)
      })

      return {
        allowed: false,
        remainingTime: Math.ceil(blockDuration / 1000),
        error: 'Too many failed attempts. Account temporarily blocked'
      }
    }

    return { allowed: true, remainingAttempts: maxAttempts - attempts.count }
  }

  async checkSignupAttempts(ip: string): Promise<RateLimitResult> {
    const key = `signup:${ip}`
    const now = Date.now()
    const window = 30 * 60 * 1000 // 30 minutos
    const maxAttempts = 3

    // Lógica similar ao checkLoginAttempts
    // ...
  }

  async clearAttempts(email: string, ip: string): Promise<void> {
    const key = `${email}:${ip}`
    this.attempts.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    const hour = 60 * 60 * 1000

    for (const [key, attempts] of this.attempts.entries()) {
      if (now - attempts.lastAttempt > hour) {
        this.attempts.delete(key)
      }
    }
  }
}

interface UserAttempts {
  count: number
  lastAttempt: number
  blockedUntil: number
}

interface RateLimitResult {
  allowed: boolean
  remainingAttempts?: number
  remainingTime?: number
  error?: string
}
```

### Tipos de Rate Limiting

| Tipo | Limite | Janela | Aplicação |
|------|--------|--------|-----------|
| Login | 5 tentativas | 15 minutos | Por IP + email |
| Cadastro | 3 tentativas | 30 minutos | Por IP |
| Recuperação | 3 tentativas | 1 hora | Por IP + email |
| API Geral | 100 requisições | 1 minuto | Por usuário autenticado |

## 🔧 Middleware de Autenticação

### Middleware Principal

```typescript
// src/middlewares/auth.ts
export const authenticateMiddleware = async (request, reply) => {
  try {
    // Extrai token do header Authorization
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Valida o token
    const payload = await jwtService.verifyAccessToken(token)

    // Adiciona informações do usuário ao request
    request.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      firstName: payload.firstName,
      sessionId: payload.sessionId
    }

    // Continua para a rota
  } catch (error) {
    request.log.error('Authentication failed', { error: error.message })

    return reply.code(401).send({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    })
  }
}
```

### Middleware Opcional

```typescript
// Autenticação opcional (não bloqueia se não houver token)
export const optionalAuthMiddleware = async (request, reply) => {
  const authHeader = request.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = await jwtService.verifyAccessToken(token)

      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        firstName: payload.firstName,
        sessionId: payload.sessionId
      }
    } catch (error) {
      // Ignora erro, continue sem autenticação
      request.log.warn('Optional auth failed', { error: error.message })
    }
  }
}
```

## 🔄 Refresh Tokens

### Sistema de Refresh Token

```typescript
// src/lib/refresh-token.ts
export class RefreshTokenService {
  async createRefreshToken(userId: string): Promise<string> {
    const token = generateRandomToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    await prisma.token.create({
      data: {
        type: 'PASSWORD_RECOVER',
        token,
        userId,
        expiresAt
      }
    })

    return token
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenResult> {
    const storedToken = await prisma.token.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!storedToken) {
      throw new Error('Invalid refresh token')
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.token.delete({ where: { id: storedToken.id } })
      throw new Error('Expired refresh token')
    }

    if (!storedToken.user.isActive) {
      throw new Error('User account is inactive')
    }

    return {
      userId: storedToken.userId,
      user: storedToken.user,
      tokenId: storedToken.id
    }
  }

  async revokeToken(token: string): Promise<void> {
    await prisma.token.deleteMany({
      where: { token }
    })
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.token.deleteMany({
      where: { userId }
    })
  }

  async cleanupExpiredTokens(): Promise<void> {
    await prisma.token.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
  }
}
```

### Endpoint de Refresh

```typescript
// src/http/routes/auth/refresh.ts
app.post('/auth/refresh', {
  schema: {
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  const { refreshToken } = request.body

  try {
    const tokenData = await refreshTokenService.verifyRefreshToken(refreshToken)

    // Revoga o token antigo (rotation)
    await refreshTokenService.revokeToken(refreshToken)

    // Gera novos tokens
    const tokens = await jwtService.generateAccessTokens(tokenData.user)

    return reply.send({
      user: {
        id: tokenData.user.id,
        name: tokenData.user.name,
        email: tokenData.user.email,
        firstName: tokenData.user.firstName
      },
      ...tokens
    })
  } catch (error) {
    return reply.code(401).send({
      error: 'Invalid or expired refresh token'
    })
  }
})
```

## 🚨 Segurança Avançada

### Blacklist de Emails

```typescript
// src/lib/email-blacklist.ts
export class EmailBlacklist {
  private readonly blacklist = new Set([
    // Emails maliciosos conhecidos
    'malicious@example.com',
    'spam@test.com',
    // ... adicionado via admin panel
  ])

  async isBlacklisted(email: string): Promise<boolean> {
    // Verifica blacklist local
    if (this.blacklist.has(email.toLowerCase())) {
      return true
    }

    // Verifica serviços de email temporários
    if (this.isTempEmail(email)) {
      return true
    }

    // Verifica contra serviços externos (opcional)
    return await this.checkExternalBlacklist(email)
  }

  private isTempEmail(email: string): boolean {
    const tempDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com'
    ]

    const domain = email.split('@')[1]?.toLowerCase()
    return tempDomains.some(temp => domain?.includes(temp))
  }

  async addToBlacklist(email: string, reason: string): Promise<void> {
    this.blacklist.add(email.toLowerCase())

    // Log para auditoria
    securityLogger.warn('Email added to blacklist', { email, reason })

    // Opcional: verificar se há usuário com este email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false }
      })

      // Revoca todos os tokens do usuário
      await refreshTokenService.revokeAllUserTokens(user.id)
    }
  }
}
```

### Proteção Contra Timing Attacks

```typescript
// Constant time comparison para senhas
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
```

### Headers de Segurança

```typescript
// src/middlewares/security-headers.ts
export const securityHeadersMiddleware = (request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'DENY')
  reply.header('X-XSS-Protection', '1; mode=block')
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  reply.header('Content-Security-Policy', "default-src 'self'")
}
```

## 📊 Monitoramento e Logging

### Security Logger

```typescript
// src/lib/security-logger.ts
export const securityLogger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      service: 'security',
      message,
      meta,
      timestamp: new Date().toISOString()
    }))
  },

  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      service: 'security',
      message,
      meta,
      timestamp: new Date().toISOString()
    }))
  },

  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      service: 'security',
      message,
      meta,
      timestamp: new Date().toISOString()
    }))
  }
}
```

### Eventos Monitorados

- Tentativas de login falhas
- Múltiplas tentativas de senha
- Tokens inválidos
- Acessos suspeitos
- Mudanças de senha
- Criação de contas

## 🧪 Testes de Segurança

### Testes Unitários

```typescript
describe('Password Service', () => {
  it('should validate password strength correctly', () => {
    const weakPassword = '123456'
    const strongPassword = 'SenhaForte123!'

    expect(passwordService.validateStrength(weakPassword).isValid).toBe(false)
    expect(passwordService.validateStrength(strongPassword).isValid).toBe(true)
  })

  it('should hash and verify passwords correctly', async () => {
    const password = 'TestPassword123!'
    const hash = await passwordService.hash(password)

    expect(await passwordService.verify(password, hash)).toBe(true)
    expect(await passwordService.verify('WrongPassword', hash)).toBe(false)
  })
})

describe('JWT Service', () => {
  it('should generate and verify tokens correctly', async () => {
    const user = { id: '123', email: 'test@example.com', name: 'Test', firstName: 'Test' }
    const tokens = await jwtService.generateAccessTokens(user)

    const payload = await jwtService.verifyAccessToken(tokens.accessToken)
    expect(payload.sub).toBe(user.id)
    expect(payload.email).toBe(user.email)
  })

  it('should reject expired tokens', async () => {
    // Simula token expirado
    const expiredToken = generateExpiredToken()

    await expect(jwtService.verifyAccessToken(expiredToken))
      .rejects.toThrow('Invalid token')
  })
})
```

### Testes de Integração

```typescript
describe('Authentication Flow', () => {
  it('should complete full auth flow successfully', async () => {
    // 1. Criar usuário
    const createUserResponse = await app.inject({
      method: 'POST',
      url: '/users',
      payload: validUserData
    })
    expect(createUserResponse.statusCode).toBe(201)

    // 2. Login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/sessions/password',
      payload: {
        email: validUserData.email,
        password: validUserData.password
      }
    })
    expect(loginResponse.statusCode).toBe(200)

    const { accessToken, refreshToken } = loginResponse.json()

    // 3. Acessar rota protegida
    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(protectedResponse.statusCode).toBe(200)

    // 4. Refresh token
    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken }
    })
    expect(refreshResponse.statusCode).toBe(200)
    expect(refreshResponse.json().accessToken).toBeDefined()
  })
})
```

## 📈 Melhores Práticas

### Para Desenvolvedores
1. **Environment Variables**: Nunca exponha secrets
2. **Input Validation**: Valide sempre no backend
3. **Error Messages**: Não exponha informações sensíveis
4. **Token Storage**: Use httpOnly cookies em produção
5. **HTTPS**: Obrigatório em produção

### Para Usuários
1. **Password Managers**: Use gerenciadores de senha
2. **2FA**: Implemente autenticação de dois fatores
3. **Session Management**: Faça logout em dispositivos compartilhados
4. **Password Rotation**: Altere senhas periodicamente

---

Este sistema de autenticação foi projetado com segurança como prioridade máxima, implementando as melhores práticas da indústria e múltiplas camadas de proteção.