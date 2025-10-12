# Deployment Guide

## Overview

This guide covers building and deploying the Model Client React application to various hosting platforms.

## Building for Production

### Build Command

```bash
npm run build
```

This command:
1. Runs TypeScript compiler (`tsc -b`)
2. Bundles the application with Vite
3. Optimizes assets (minification, tree-shaking)
4. Outputs to the `dist/` folder

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── index-[hash].css     # Compiled CSS
│   └── [assets]-[hash].*    # Images, fonts, etc.
├── index.html               # Entry point
└── vite.svg                 # Favicon
```

### Preview Build Locally

```bash
npm run preview
```

This starts a local server to preview the production build.

## Environment Variables

### Build-Time Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

```env
# .env.production
VITE_API_URL=https://api.production.com
VITE_APP_NAME=Model Client
```

### Loading Environment Variables

```tsx
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE // 'development' | 'production'
```

### Environment Files

```
.env                # Loaded in all cases
.env.local          # Loaded in all cases, ignored by git
.env.[mode]         # Only loaded in specified mode
.env.[mode].local   # Only loaded in specified mode, ignored by git
```

Priority (highest to lowest):
1. `.env.[mode].local`
2. `.env.[mode]`
3. `.env.local`
4. `.env`

## Deployment Platforms

### 1. Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Built-in environment variables
- Automatic deployments from Git

**Deploy via CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Deploy via GitHub:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variables
7. Click "Deploy"

**Environment Variables in Vercel:**

```
Project Settings → Environment Variables

VITE_API_URL=https://api.production.com
```

### 2. Netlify

**Deploy via CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

**Deploy via GitHub:**

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Choose your GitHub repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables
7. Click "Deploy site"

**netlify.toml Configuration:**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 3. Cloudflare Pages

**Deploy via CLI:**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy dist
```

**Deploy via GitHub:**

1. Push code to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
3. Navigate to Pages → Create a project
4. Connect your GitHub repository
5. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Add environment variables
7. Click "Save and Deploy"

### 4. GitHub Pages

**Setup:**

```bash
# Install gh-pages
npm install --save-dev gh-pages
```

**Add to package.json:**

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repository-name"
}
```

**Update vite.config.ts:**

```typescript
export default defineConfig({
  base: '/repository-name/', // Repository name
  plugins: [react(), tailwindcss()],
})
```

**Deploy:**

```bash
npm run deploy
```

**Enable GitHub Pages:**
1. Go to repository Settings → Pages
2. Select branch: `gh-pages`
3. Click "Save"

### 5. AWS S3 + CloudFront

**Build and Upload:**

```bash
# Build
npm run build

# Install AWS CLI
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

**S3 Bucket Configuration:**
- Enable static website hosting
- Set index document: `index.html`
- Set error document: `index.html` (for SPA routing)
- Configure CORS if needed

**CloudFront Configuration:**
- Origin: S3 bucket
- Default root object: `index.html`
- Custom error responses: 404 → 200 → `/index.html`

### 6. Traditional Server (Nginx/Apache)

**Build:**

```bash
npm run build
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Apache Configuration (.htaccess):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Upload Files:**

```bash
# Using SCP
scp -r dist/* user@yourserver.com:/var/www/html/

# Using SFTP
sftp user@yourserver.com
put -r dist/* /var/www/html/

# Using rsync
rsync -avz dist/ user@yourserver.com:/var/www/html/
```

### 7. Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and Run:**

```bash
# Build image
docker build -t model-client-react .

# Run container
docker run -p 8080:80 model-client-react

# With environment variables
docker run -p 8080:80 \
  -e VITE_API_URL=https://api.production.com \
  model-client-react
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=https://api.production.com
    restart: unless-stopped
```

## CI/CD Pipelines

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI/CD

**.gitlab-ci.yml:**

```yaml
image: node:18

stages:
  - build
  - deploy

cache:
  paths:
    - node_modules/

build:
  stage: build
  script:
    - npm ci
    - npm run lint
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  only:
    - main
  script:
    - npm install -g vercel
    - vercel --token $VERCEL_TOKEN --prod --yes
```

## Performance Optimization

### Build Optimization

**Vite Configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Manual chunking for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
})
```

### Asset Optimization

**Images:**
- Use WebP format when possible
- Compress images before deployment
- Use lazy loading for images
- Implement responsive images

**Code Splitting:**
```tsx
import { lazy } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
```

### Caching Strategy

**Cache Headers:**
```nginx
# Immutable assets (with hash in filename)
location ~* \.[a-f0-9]{8}\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Other static assets
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public";
}

# HTML (no cache)
location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

## Monitoring & Analytics

### Error Tracking (Sentry)

```tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Analytics (Google Analytics)

```tsx
// src/lib/analytics.ts
export function initAnalytics() {
  if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', import.meta.env.VITE_GA_ID)
  }
}

export function trackPageView(path: string) {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: path,
    })
  }
}
```

## Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.production.com"
>
```

### Environment Variables Security

- Never commit `.env` files
- Use separate variables for different environments
- Store secrets in hosting platform's secret management
- Never expose sensitive data to client-side code

### HTTPS

Always use HTTPS in production:
- Most hosting platforms provide automatic HTTPS
- For custom servers, use Let's Encrypt for free SSL certificates

## Troubleshooting

### Build Errors

**Problem:** Out of memory during build
```bash
# Increase Node.js memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Problem:** TypeScript errors
```bash
# Check types
npm run type-check

# Skip type checking (not recommended)
npx vite build --no-typecheck
```

### Runtime Errors

**Problem:** White screen on deployment
- Check browser console for errors
- Verify environment variables are set
- Check base URL configuration in `vite.config.ts`

**Problem:** 404 on page refresh
- Configure server to serve `index.html` for all routes
- Add redirect rules (see server configuration above)

### Performance Issues

**Problem:** Large bundle size
- Analyze bundle: `npm run build -- --stats`
- Use code splitting
- Remove unused dependencies
- Optimize imports

## Checklist Before Deployment

- [ ] Run linter: `npm run lint`
- [ ] Check TypeScript: `npm run build`
- [ ] Test locally: `npm run preview`
- [ ] Update environment variables
- [ ] Test on different browsers
- [ ] Test responsive design
- [ ] Check loading performance
- [ ] Verify API endpoints
- [ ] Test error scenarios
- [ ] Update documentation
- [ ] Create git tag for release

## Post-Deployment

1. **Verify deployment**: Visit the production URL
2. **Test critical flows**: Login, navigation, forms
3. **Check analytics**: Verify tracking is working
4. **Monitor errors**: Check error tracking dashboard
5. **Performance**: Run Lighthouse audit
6. **Rollback plan**: Keep previous version available

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Cloudflare Pages](https://developers.cloudflare.com/pages)
- [GitHub Pages](https://pages.github.com)
- [Docker Documentation](https://docs.docker.com)
