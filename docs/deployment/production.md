# 🚀 Guia de Deploy em Produção

Guia completo para deploy do Omnity Backend em ambiente de produção, incluindo configurações de segurança, performance, monitoramento e boas práticas.

## 🎯 Visão Geral

Este guia cobre o deployment do Omnity Backend em produção com foco em:
- **Segurança**: Configurações robustas e isolamento
- **Performance**: Otimização e escalabilidade
- **Monitoramento**: Logs e métricas
- **Manutenção**: Atualizações e backup
- **Recuperação**: Planos de disaster recovery

## 🏗️ Arquitetura de Produção

### Topologia Recomendada

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │      CDN        │    │      WAF        │
│    (Nginx/HA)   │────│  (CloudFlare)   │────│   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Server 1   │  │  Server 2   │  │  Server N   │           │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
          │
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           PostgreSQL Primary (Master)                       │ │
│  │            (High Availability)                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           PostgreSQL Replicas (Read)                        │ │
│  │              (Load Balancing)                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Services                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Redis     │  │ Monitoring  │  │    Logs     │           │
│  │   (Cache)   │  │ (Prometheus)│  │ (ELK Stack) │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Configurações de Produção

### 1. Variáveis de Ambiente

#### .env.production
```env
# Server Configuration
NODE_ENV="production"
PORT=3000
HOST="0.0.0.0"

# Database (Production)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require&connection_limit=20"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Security
JWT_SECRET="your-super-secure-jwt-secret-256-bits-long-random-string"
JWT_REFRESH_SECRET="your-refresh-token-secret-different-from-access"
CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL/HTTPS
SSL_CERT_PATH="/etc/ssl/certs/yourdomain.com.crt"
SSL_KEY_PATH="/etc/ssl/private/yourdomain.com.key"
FORCE_HTTPS=true

# Logging
LOG_LEVEL="info"
LOG_FORMAT="json"
LOG_FILE="/var/log/omnity/app.log"

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHE=true
CACHE_TTL=300

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000

# External Services
REDIS_URL="redis://username:password@redis-host:6379"
REDIS_TTL=3600

# Email (if needed)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# Application
APP_NAME="Omnity Backend"
APP_VERSION="1.0.0"
APP_URL="https://api.yourdomain.com"
```

### 2. Configuração do Servidor

#### systemd Service File
```ini
# /etc/systemd/system/omnity-backend.service
[Unit]
Description=Omnity Backend API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=omnity
Group=omnity
WorkingDirectory=/opt/omnity/backend
Environment=NODE_ENV=production
EnvironmentFile=/opt/omnity/backend/.env.production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=omnity-backend

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/omnity/backend/logs /tmp

# Resource Limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### Habilitar e Iniciar Serviço
```bash
# Reload systemd
sudo systemctl daemon-reload

# Habilitar serviço
sudo systemctl enable omnity-backend

# Iniciar serviço
sudo systemctl start omnity-backend

# Verificar status
sudo systemctl status omnity-backend

# Verificar logs
sudo journalctl -u omnity-backend -f
```

### 3. Nginx Configuration

#### /etc/nginx/sites-available/omnity-backend
```nginx
upstream omnity_backend {
    server 127.0.0.1:3000;
    # Add more servers for load balancing
    # server 127.0.0.1:3001;
    # server 127.0.0.1:3002;

    # Health check
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/omnity-backend.access.log;
    error_log /var/log/nginx/omnity-backend.error.log;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/json
        application/javascript
        text/css
        text/plain
        text/xml;

    # API Routes
    location / {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;

        # Proxy settings
        proxy_pass http://omnity_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Authentication endpoints - stricter rate limiting
    location ~ ^/(users|sessions/password|password) {
        limit_req zone=auth burst=10 nodelay;

        proxy_pass http://omnity_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket endpoints
    location /socket.io/ {
        proxy_pass http://omnity_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://omnity_backend;
        access_log off;
    }

    # Metrics endpoint (restricted)
    location /metrics {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://omnity_backend;
    }
}
```

## 🚀 Processo de Deploy

### 1. Build e Testes

#### build.sh
```bash
#!/bin/bash
set -e

echo "🚀 Starting production build..."

# Clean previous build
rm -rf dist/

# Install dependencies
npm ci --only=production

# Type checking
npm run type-check

# Run tests
npm test

# Build application
npm run build

# Verify build
if [ ! -f "dist/server.js" ]; then
    echo "❌ Build failed - server.js not found"
    exit 1
fi

echo "✅ Build completed successfully"
```

### 2. Deploy Script

#### deploy.sh
```bash
#!/bin/bash
set -e

# Configuration
APP_DIR="/opt/omnity/backend"
BACKUP_DIR="/opt/omnity/backups"
SERVICE_NAME="omnity-backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment process..."

# Create backup
echo "📦 Creating backup..."
sudo -u omnity mkdir -p $BACKUP_DIR
sudo cp -r $APP_DIR $BACKUP_DIR/backend_$TIMESTAMP

# Run tests
echo "🧪 Running tests..."
./build.sh

# Stop service
echo "⏹️ Stopping service..."
sudo systemctl stop $SERVICE_NAME

# Deploy new version
echo "📋 Deploying new version..."
sudo -u omnity cp -r dist/* $APP_DIR/
sudo -u omnity cp .env.production $APP_DIR/.env
sudo -u omnity cp package*.json $APP_DIR/
sudo -u omnity cp -r node_modules $APP_DIR/

# Update database migrations if needed
echo "🗄️ Running database migrations..."
cd $APP_DIR
sudo -u omnity npm run db:deploy

# Restart service
echo "▶️ Starting service..."
sudo systemctl start $SERVICE_NAME

# Health check
echo "🏥 Performing health check..."
sleep 10
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✅ Deployment successful!"
    echo "🧹 Cleaning up old backups..."
    find $BACKUP_DIR -name "backend_*" -mtime +7 -delete
else
    echo "❌ Health check failed! Rolling back..."
    sudo systemctl stop $SERVICE_NAME
    sudo rm -rf $APP_DIR/*
    sudo cp -r $BACKUP_DIR/backend_$TIMESTAMP/* $APP_DIR/
    sudo systemctl start $SERVICE_NAME
    echo "🔄 Rollback completed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
```

### 3. CI/CD Pipeline (GitHub Actions)

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type check
      run: npm run type-check

    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/omnity/backend
          git pull origin main
          ./deploy.sh
```

## 📊 Monitoramento e Logs

### 1. Prometheus Metrics

#### metrics.ts
```typescript
import { register, Counter, Histogram, Gauge } from 'prom-client'

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

export const activeConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
})

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
})

export const jwtTokensIssued = new Counter({
  name: 'jwt_tokens_issued_total',
  help: 'Total number of JWT tokens issued'
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
register.registerMetric(activeConnections)
register.registerMetric(databaseConnections)
register.registerMetric(jwtTokensIssued)
```

### 2. Log Configuration

#### logger.ts
```typescript
import winston from 'winston'
import 'winston-daily-rotate-file'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'omnity-backend',
    version: process.env.APP_VERSION
  },
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    // All logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    // Console in development
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
})

export default logger
```

### 3. Health Check Endpoint

#### health.ts
```typescript
export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: HealthCheck
    redis?: HealthCheck
    memory: HealthCheck
    disk: HealthCheck
  }
}

interface HealthCheck {
  status: 'ok' | 'error'
  responseTime?: number
  error?: string
  details?: any
}

export async function performHealthCheck(): Promise<HealthResponse> {
  const startTime = Date.now()

  // Database check
  const dbCheck = await checkDatabase()

  // Redis check (if configured)
  const redisCheck = process.env.REDIS_URL ? await checkRedis() : undefined

  // Memory check
  const memCheck = checkMemory()

  // Disk check
  const diskCheck = await checkDisk()

  const overallStatus = [dbCheck, redisCheck, memCheck, diskCheck]
    .filter(Boolean)
    .every(check => check?.status === 'ok') ? 'ok' : 'error'

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      database: dbCheck,
      redis: redisCheck,
      memory: memCheck,
      disk: diskCheck
    }
  }
}
```

## 🔐 Segurança em Produção

### 1. SSL/TLS Configuration

#### Certbot/Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

#### UFW Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow monitoring from internal network
sudo ufw allow from 10.0.0.0/8 to any port 9090

# Deny other ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 3. Security Headers

#### security-middleware.ts
```typescript
export const securityMiddleware = (request: FastifyRequest, reply: FastifyReply) => {
  const headers = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }

  Object.entries(headers).forEach(([key, value]) => {
    reply.header(key, value)
  })
}
```

## 📈 Performance Optimization

### 1. Database Optimization

#### Connection Pooling
```typescript
// prisma/production.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Connection pool settings
  connection_limit = 20
  pool_timeout = 30
  connect_timeout = 60
}
```

#### Query Optimization
```typescript
// Optimized queries with select and include
const optimizedProjects = await prisma.project.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    priority: true,
    progress: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        tasks: true,
        requirements: true
      }
    }
  },
  where: {
    userId: request.user.id,
    deletedAt: null
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 20,
  skip: (page - 1) * 20
})
```

### 2. Caching Strategy

#### Redis Cache
```typescript
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  // Cache user projects
  async cacheUserProjects(userId: string, projects: any[]): Promise<void> {
    const key = `user:${userId}:projects`
    await this.set(key, projects, 300) // 5 minutes
  }
}
```

### 3. Compression and Minification

#### Compression Middleware
```typescript
import fastifyCompress from '@fastify/compress'

app.register(fastifyCompress, {
  global: true,
  encodings: ['gzip', 'deflate', 'br'],
  threshold: 1024
})
```

## 🔄 Backup e Recuperação

### 1. Database Backup Script

#### backup-db.sh
```bash
#!/bin/bash

set -e

# Configuration
DB_HOST="your-db-host"
DB_PORT="5432"
DB_NAME="omnity_prod"
DB_USER="postgres"
BACKUP_DIR="/opt/backups/database"
S3_BUCKET="omnity-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🗄️ Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --no-password --format=custom --compress=9 \
  --file="$BACKUP_DIR/backup_$TIMESTAMP.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.dump" \
  "s3://$S3_BUCKET/database/backup_$TIMESTAMP.dump"

# Clean local files older than 7 days
find $BACKUP_DIR -name "backup_*.dump" -mtime +7 -delete

# Clean S3 files older than 30 days
aws s3 ls "s3://$S3_BUCKET/database/" | \
  while read -r line; do
    createDate=$(echo "$line" | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date -d "30 days ago" +%s)

    if [[ $createDate -lt $olderThan ]]; then
      fileName=$(echo "$line" | awk '{print $4}')
      if [[ $fileName != "" ]]; then
        aws s3 rm "s3://$S3_BUCKET/database/$fileName"
      fi
    fi
  done

echo "✅ Database backup completed"
```

### 2. Application Backup

#### backup-app.sh
```bash
#!/bin/bash

set -e

APP_DIR="/opt/omnity/backend"
BACKUP_DIR="/opt/backups/application"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Starting application backup..."

# Create backup
tar -czf "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" \
  -C "$APP_DIR" \
  dist/ \
  .env.production \
  package*.json \
  node_modules/

# Upload to S3
aws s3 cp "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" \
  "s3://omnity-backups/application/app_backup_$TIMESTAMP.tar.gz"

# Clean old backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Application backup completed"
```

### 3. Cron Jobs Setup

#### crontab -e
```bash
# Database backup - daily at 2 AM
0 2 * * * /opt/omnity/scripts/backup-db.sh >> /var/log/omnity/backup.log 2>&1

# Application backup - weekly on Sunday at 3 AM
0 3 * * 0 /opt/omnity/scripts/backup-app.sh >> /var/log/omnity/backup.log 2>&1

# Log rotation - daily at midnight
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/omnity

# Health check - every 5 minutes
*/5 * * * * curl -f http://localhost:3000/health || echo "Health check failed" | mail -s "Omnity Health Check Alert" admin@yourdomain.com
```

## 🚨 Disaster Recovery

### 1. Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
DB_HOST="your-db-host"
DB_NAME="omnity_prod"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🔄 Starting database recovery..."

# Stop application
sudo systemctl stop omnity-backend

# Restore database
pg_restore -h $DB_HOST -U postgres -d $DB_NAME \
  --clean --if-exists --verbose "$BACKUP_FILE"

# Start application
sudo systemctl start omnity-backend

echo "✅ Database recovery completed"
```

#### Full System Recovery
```bash
#!/bin/bash
# restore-system.sh

TIMESTAMP=$1

if [ -z "$TIMESTAMP" ]; then
    echo "Usage: $0 <timestamp>"
    exit 1
fi

echo "🔄 Starting full system recovery..."

# Stop services
sudo systemctl stop omnity-backend nginx

# Restore application
tar -xzf "/opt/backups/application/app_backup_$TIMESTAMP.tar.gz" \
  -C /opt/omnity/backend/

# Restore database
/opt/omnity/scripts/restore-db.sh \
  "/opt/backups/database/backup_$TIMESTAMP.dump"

# Start services
sudo systemctl start nginx
sudo systemctl start omnity-backend

# Verify health
sleep 30
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✅ System recovery completed successfully"
else
    echo "❌ System recovery failed - manual intervention required"
    exit 1
fi
```

### 2. Monitoring Alerts

#### Prometheus Alerting Rules
```yaml
# alerts.yml
groups:
  - name: omnity-backend
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time detected
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionFailure
        expr: database_connections_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection failure
          description: "No active database connections"

      - alert: ServiceDown
        expr: up{job="omnity-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Omnity Backend is down
          description: "The Omnity Backend service is not responding"
```

---

Este guia de produção fornece uma base sólida para deploy seguro, performático e monitorado do Omnity Backend em ambiente de produção.