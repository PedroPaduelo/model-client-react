# 🧠 Índice de Memória do Sistema

> **Última atualização:** 2025-10-21
> **Total de entidades:** 2
> **Tipo de projeto:** React Frontend Application

## 🔍 Guia de Busca Rápida

### Por Domínio

#### 🔐 Autenticação e Segurança
- **Query:** `#tech:auth OR #security:token OR autenticacao`
- **Entidades principais:**
  - *[A ser documentado]* - Sistema de autenticação
  - *[A ser documentado]* - Login/Register pages
  - *[A ser documentado]* - Protected routes

#### 🎨 Frontend e UI
- **Query:** `#tech:react OR #domain:ui OR frontend`
- **Entidades principais:**
  - *[A ser documentado]* - Componentes shadcn/ui
  - *[A ser documentado]* - Dashboard interface
  - *[A ser documentado]* - Responsive design

#### 🗂️ Estado e Navegação
- **Query:** `#tech:react-router OR #domain:navigation OR routing`
- **Entidades principais:**
  - *[A ser documentado]* - React Router setup
  - *[A ser documentado]* - Route protection
  - *[A ser documentado]* - Navigation components

#### 📝 Formulários e Validação
- **Query:** `#tech:react-hook-form OR #tech:zod OR form`
- **Entidades principais:**
  - *[A ser documentado]* - Form validation
  - *[A ser documentado]* - Schema definitions
  - *[A ser documentado]* - Form components

### Por Tecnologia

- **React 19.1.1:** `#tech:react #version:19.1.1`
- **TypeScript 5.8.3:** `#tech:typescript #version:5.8.3`
- **Vite 7.1.2:** `#tech:vite #version:7.1.2`
- **Tailwind CSS 4.1.13:** `#tech:tailwind #version:4.1.13`
- **shadcn/ui:** `#tech:shadcn #tech:radix-ui`
- **React Router DOM 7.8.2:** `#tech:react-router #version:7.8.2`
- **React Hook Form 7.62.0:** `#tech:react-hook-form #version:7.62.0`
- **Zod 4.1.5:** `#tech:zod #version:4.1.5`

### Por Tipo de Entidade

- **Componentes:** `component_` OR `#type:component`
- **Páginas:** `page_` OR `#type:page`
- **Hooks:** `hook_` OR `#type:hook`
- **Utilitários:** `util_` OR `#type:util`
- **Configurações:** `config_` OR `#type:config`
- **Rotas:** `route_` OR `#type:route`
- **Tipos:** `type_` OR `#type:type`

### Por Status

- **Ativo:** `#status:ativo`
- **Em desenvolvimento:** `#status:dev`
- **Planejado:** `#status:planejado`
- **Deprecated:** `#status:deprecated`

## 📊 Mapa de Relações Principais

```
App
  ├── renderiza → Router
  ├── utiliza → ThemeProvider
  └── configura → Vite

Router
  ├── protege → ProtectedRoutes
  ├── redireciona → AuthPages
  └── renderiza → DashboardPages

Componentes UI
  ├── baseia-se → Radix UI
  ├── estiliza-com → Tailwind CSS
  └── gerencia-forms → React Hook Form

Formulários
  ├── valida-com → Zod
  └── gerencia-estado → React Hook Form
```

## 🏗️ Estrutura do Projeto

### Frontend Architecture
- **Framework:** React 19.1.1 + TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **Styling:** Tailwind CSS 4.1.13 + shadcn/ui
- **Routing:** React Router DOM 7.8.2
- **Forms:** React Hook Form + Zod
- **Development Server:** http://localhost:5173

### Componentes Principais
- **Autenticação:** Login, Register pages
- **Dashboard:** Home, Agout pages
- **UI Components:** 50+ componentes shadcn/ui
- **Layouts:** AuthLayout, DashboardLayout

## 🆕 Últimas Atualizações

- **2025-10-21:** Iniciado servidor de desenvolvimento (http://localhost:5173)
- **2025-10-21:** Criado memory-index.md para projeto React frontend
- **2025-10-21:** Memorizado projeto_react_frontend e documentação
- **[data]:** [descrição da mudança]

## 📝 Como Usar Este Índice

1. **Encontre sua categoria** ou tecnologia acima
2. **Copie a query** sugerida
3. **Use:** `search_nodes({ query: "query_aqui" })`
4. **Refine** se necessário adicionando mais termos

## ⚙️ Configurações Principais

### Ambiente
- **Variável:** `VITE_API_URL=http://localhost:3013`
- **Arquivo:** `.env`
- **Porta dev:** 5173

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificação de código

## 📚 Documentação Disponível

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Estrutura e padrões
- [COMPONENTS.md](./COMPONENTS.md) - Guia de componentes
- [ROUTING.md](./ROUTING.md) - Configuração de rotas
- [STYLING.md](./STYLING.md) - Guia de estilização
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Workflow de desenvolvimento
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy

## ⚠️ Importante

- Este é um projeto **frontend React** moderno
- Usa **Vite** para desenvolvimento rápido
- Interface baseada em **shadcn/ui** + **Tailwind CSS**
- Backend esperado em `http://localhost:3013`
- Sempre atualize este índice ao criar novas entidades
- Use as queries sugeridas como ponto de partida
- Combine múltiplos termos para buscas mais precisas