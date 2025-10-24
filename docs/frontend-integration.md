# 🚀 Guia de Integração Frontend - Omnity Backend

> **Versão:** v1.0.0 | **Última atualização:** 2025-01-25  
> **Compatível com:** React 18+, Next.js 14+, Vue 3+, Angular 15+

Este guia completo explica como consumir a API Omnity Backend em aplicações frontend modernas, desde configuração inicial até exemplos práticos de implementação.

## 📋 Índice

1. [📖 Como Ler a Documentação](#-como-ler-a-documentação)
2. [⚙️ Configuração Inicial](#️-configuração-inicial)
3. [🔐 Autenticação](#-autenticação)
4. [📊 Exemplos Práticos](#-exemplos-práticos)
5. [🛠️ Client HTTP](#️-client-http)
6. [🔧 Estado Global](#-estado-global)
7. [🚨 Tratamento de Erros](#-tratamento-de-erros)
8. [📱 Componentes Reutilizáveis](#-componentes-reutilizáveis)
9. [🔍 Padrões Avançados](#-padrões-avançados)
10. [🆘 Troubleshooting](#-troubleshooting)

---

## 📖 Como Ler a Documentação

### 🎯 Estrutura da Documentação Backend

A documentação do Omnity Backend está organizada em uma hierarquia clara:

```
docs/
├── README.md              # Visão geral e getting started
├── memory-index.md        # Índice de memória do sistema
├── api/                   # Documentação das APIs (SEU FOCO PRINCIPAL)
│   ├── authentication.md  # Autenticação (LEIA PRIMEIRO)
│   ├── projects.md        # Gestão de projetos
│   ├── tasks.md          # Gestão de tarefas
│   ├── requirements.md   # Gestão de requisitos
│   ├── notifications.md  # Sistema de notificações
│   ├── tags.md           # Sistema de tags
│   └── websocket.md      # Tempo real
├── database/             # Schema do banco
├── security/             # Segurança
└── deployment/           # Deploy
```

### 📚 Ordem Recomendada de Leitura

1. **`docs/README.md`** - Visão geral do sistema
2. **`docs/api/authentication.md`** - Sistema de autenticação (OBRIGATÓRIO primeiro)
3. **`docs/api/projects.md`** - Gestão de projetos
4. **Outros endpoints** - Conforme sua necessidade

### 🔍 Como Interpretar a Documentação de API

Cada endpoint na documentação segue este padrão:

```markdown
### Método Endpoint
**POST** `/users`

#### Request Body
```typescript
interface CreateUserRequest {
  name: string      // Nome completo (3-100 caracteres)
  email: string     // Email válido e único
  password: string  // Senha forte
}
```

#### Response (201)
```typescript
interface CreateUserResponse {
  user: {
    id: string
    name: string
    email: string
  }
  message: string
}
```

#### Exemplo
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@teste.com", "password": "SenhaForte123!"}'
```

#### Possíveis Erros
- `400`: Dados inválidos
- `409`: Email já cadastrado
```

### 🎯 Informações Essenciais em Cada Endpoint

- **Método HTTP**: GET, POST, PUT, DELETE, PATCH
- **URL completa**: Incluindo parâmetros de path
- **Headers necessários**: Principalmente `Authorization: Bearer <token>`
- **Request Body**: Estrutura dos dados a enviar
- **Response**: Estrutura dos dados recebidos
- **Status Code**: Código HTTP esperado
- **Exemplos**: Comando curl e casos de uso
- **Erros**: Códigos de erro e quando ocorrem

---

## ⚙️ Configuração Inicial

### 📦 Instalação de Dependências

#### Para React/Next.js
```bash
npm install axios @tanstack/react-query zustand date-fns
npm install -D @types/node
```

#### Para Vue 3
```bash
npm install axios @tanstack/vue-query pinia date-fns
npm install -D @types/node
```

#### Para Angular
```bash
npm install @tanstack/angular-query-experimental date-fns
```

### 🔧 Variáveis de Ambiente

Crie `.env.local` (ou `.env`):

```env
# URL da API
NEXT_PUBLIC_API_URL=http://localhost:3000
# ou
VITE_API_URL=http://localhost:3000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3000
# ou
VITE_WS_URL=ws://localhost:3000

# Ambiente
NEXT_PUBLIC_ENV=development
```

### 🌐 Configuração CORS (Backend)

O backend já está configurado com CORS, mas se necessário ajustar:

```typescript
// src/server.ts
app.register(fastifyCors, {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // URLs do frontend
  credentials: true,
});
```

---

## 🔐 Autenticação

### 🏗️ Estrutura de Autenticação

A API usa JWT (JSON Web Tokens) com o seguinte fluxo:

1. **Login** → Recebe `access_token` e `refresh_token`
2. **Request** → Envia `Authorization: Bearer <access_token>`
3. **Expiração** → Usa `refresh_token` para obter novo `access_token`

### 📝 Cliente de Autenticação

#### hooks/useAuth.ts (React)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName?: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/sessions/password`, {
            email,
            password,
          });

          const { user, token, refreshToken } = response.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Configurar axios para futuras requisições
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await axios.post(`${API_URL}/sessions/refresh`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data;

          set({
            token: newToken,
            refreshToken: newRefreshToken,
          });

          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 🔒 Axios Interceptor

#### lib/api.ts
```typescript
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      const auth = JSON.parse(token);
      if (auth.state.token) {
        config.headers.Authorization = `Bearer ${auth.state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = useAuth.getState();
        await auth.refreshAuth();
        
        // Repetir request original com novo token
        const token = localStorage.getItem('auth-storage');
        if (token) {
          const authData = JSON.parse(token);
          originalRequest.headers.Authorization = `Bearer ${authData.state.token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        useAuth.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 🛡️ Componente de Proteção

#### components/ProtectedRoute.tsx
```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 📊 Exemplos Práticos

### 🎯 Login Component

#### components/LoginForm.tsx
```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### 📋 Listagem de Projetos

#### hooks/useProjects.ts
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Project {
  id: number;
  name: string;
  description: string;
  stack: string;
  status: string;
  priority: string;
  progress: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
}

interface CreateProjectData {
  name: string;
  description: string;
  stack: string;
  status?: string;
  priority?: string;
}

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data.projects as Project[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await api.post('/projects', data);
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await api.patch(`/projects/${projectId}/favorite`);
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}
```

#### components/ProjectList.tsx
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProjects } from '@/hooks/useProjects';

export function ProjectList() {
  const { projects, isLoading, deleteProject, toggleFavorite, isDeleting } = useProjects();

  if (isLoading) {
    return <div>Carregando projetos...</div>;
  }

  if (!projects?.length) {
    return <div>Nenhum projeto encontrado.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      case 'Concluído': return 'bg-blue-100 text-blue-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <button
                  onClick={() => toggleFavorite(project.id)}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  {project.isFavorite ? '⭐' : '☆'}
                </button>
              </div>

              <p className="text-gray-600 mt-1">{project.description}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>📦 {project.taskCount || 0} tarefas</span>
                <span>✅ {project.completedTaskCount || 0} concluídas</span>
                <span>🕐 Criado em {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  <strong>Stack:</strong> {project.stack}
                </p>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => window.location.href = `/projects/${project.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Ver detalhes
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 📝 Formulário de Criação de Projeto

#### components/CreateProjectForm.tsx
```typescript
import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stack: '',
    status: 'Ativo',
    priority: 'Média',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createProject, isCreating } = useProjects();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.stack.trim()) {
      newErrors.stack = 'Stack é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createProject(formData);
      onSuccess?.();
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Erro ao criar projeto',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome do Projeto *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ex: E-commerce Platform"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição *
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Descreva detalhadamente o projeto..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="stack" className="block text-sm font-medium text-gray-700">
          Stack Tecnológico *
        </label>
        <input
          id="stack"
          type="text"
          value={formData.stack}
          onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ex: Node.js, React, PostgreSQL, Redis"
        />
        {errors.stack && <p className="mt-1 text-sm text-red-600">{errors.stack}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Ativo">Ativo</option>
            <option value="Pausado">Pausado</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Prioridade
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isCreating}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isCreating ? 'Criando...' : 'Criar Projeto'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
```

---

## 🛠️ Client HTTP

### 📡 Configuração Axios Completa

#### lib/api.ts (Versão Completa)
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-storage');
        if (token) {
          const auth = JSON.parse(token);
          if (auth.state.token) {
            config.headers.Authorization = `Bearer ${auth.state.token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const auth = useAuth.getState();
            await auth.refreshAuth();
            
            const token = localStorage.getItem('auth-storage');
            if (token) {
              const authData = JSON.parse(token);
              originalRequest.headers.Authorization = `Bearer ${authData.state.token}`;
            }
            
            return this.client(originalRequest);
          } catch (refreshError) {
            useAuth.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Métodos específicos da API
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const api = new ApiClient();
```

### 🔧 Tipos TypeScript

#### types/api.ts
```typescript
// Tipos baseados na documentação da API
export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  stack: string;
  notes?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  isFavorite: boolean;
  metadata?: Record<string, any>;
  gitRepositoryUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastModel?: string;
  userId: string;
  taskCount?: number;
  completedTaskCount?: number;
  requirementCount?: number;
  notificationCount?: number;
}

export interface Task {
  id: number;
  title: string;
  taskDescription: string;
  guidancePrompt: string;
  status: TaskStatus;
  created_by: string;
  updated_by: string;
  additional_information?: string;
  result_task?: string;
  project_id: number;
  createdAt: string;
  updatedAt: string;
  todos?: TaskTodo[];
  requirements?: Requirement[];
}

export interface TaskTodo {
  id: number;
  task_id: number;
  sequence: number;
  item_description: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  id: number;
  titulo: string;
  descricao: string;
  tipo: RequirementType;
  categoria: string;
  prioridade: RequirementPriority;
  project_id: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  project_id?: number;
  user_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum ProjectStatus {
  ATIVO = 'Ativo',
  PAUSADO = 'Pausado',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado',
  EM_ANDAMENTO = 'Em Andamento',
}

export enum ProjectPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export enum TaskStatus {
  PENDENTE = 'Pendente',
  EM_PROGRESSO = 'Em Progresso',
  BLOQUEADA = 'Bloqueada',
  EM_REVISAO = 'Em Revisão',
  CONCLUIDA = 'Concluída',
}

export enum RequirementType {
  FUNCIONAL = 'Funcional',
  NAO_FUNCIONAL = 'Não Funcional',
}

export enum RequirementPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export enum NotificationPriority {
  BAIXA = 'Baixa',
  MEDIA = 'Média',
  ALTA = 'Alta',
  URGENTE = 'Urgente',
}

// Request/Response types
export interface CreateProjectRequest {
  name: string;
  description: string;
  stack: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  notes?: string;
  metadata?: Record<string, any>;
  gitRepositoryUrl?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface CreateTaskRequest {
  title: string;
  taskDescription: string;
  guidancePrompt: string;
  additional_information?: string;
  project_id: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## 🔧 Estado Global

### 🏪 Zustand Store (React)

#### stores/useProjectStore.ts
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Project, Task, Requirement } from '@/types/api';

interface ProjectState {
  // Estado
  currentProject: Project | null;
  projects: Project[];
  tasks: Task[];
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  removeProject: (id: number) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  removeTask: (id: number) => void;
  setRequirements: (requirements: Requirement[]) => void;
  addRequirement: (requirement: Requirement) => void;
  updateRequirement: (id: number, updates: Partial<Requirement>) => void;
  removeRequirement: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentProject: null,
      projects: [],
      tasks: [],
      requirements: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentProject: (project) => set({ currentProject: project }),

      setProjects: (projects) => set({ projects }),

      addProject: (project) => set((state) => ({
        projects: [...state.projects, project],
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        currentProject:
          state.currentProject?.id === id
            ? { ...state.currentProject, ...updates }
            : state.currentProject,
      })),

      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
      })),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),

      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      setRequirements: (requirements) => set({ requirements }),

      addRequirement: (requirement) => set((state) => ({
        requirements: [...state.requirements, requirement],
      })),

      updateRequirement: (id, updates) => set((state) => ({
        requirements: state.requirements.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      })),

      removeRequirement: (id) => set((state) => ({
        requirements: state.requirements.filter((r) => r.id !== id),
      })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'project-store',
    }
  )
);
```

### 🔄 React Query Config

#### hooks/queryClient.ts
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## 🚨 Tratamento de Erros

### 🛡️ Componente de Error Boundary

#### components/ErrorBoundary.tsx
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
              Oops! Algo deu errado
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              {this.state.error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
            </p>
            <div className="mt-6">
              <button
                onClick={this.handleRetry}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 📡 Componente de Notificações

#### components/Notifications.tsx
```typescript
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '@/stores/useNotificationStore';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = icons[notification.type];
        const colorClasses = colors[notification.type];

        return (
          <div
            key={notification.id}
            className={`flex items-start p-4 rounded-lg border shadow-lg max-w-sm ${colorClasses} transform transition-all duration-300 ease-in-out`}
          >
            <Icon className="flex-shrink-0 w-5 h-5 mt-0.5" />
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              {notification.message && (
                <p className="mt-1 text-sm opacity-90">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Hook para usar notificações
export function useNotification() {
  const { addNotification } = useNotificationStore();

  const showSuccess = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: duration || 5000,
    });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 8000,
    });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 6000,
    });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: duration || 5000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
```

#### stores/useNotificationStore.ts
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }],
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'notification-store',
    }
  )
);
```

---

## 📱 Componentes Reutilizáveis

### 🎨 Componente de Loading

#### components/Loading.tsx
```typescript
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600',
            sizeClasses[size]
          )}
        />
        {text && (
          <span className="ml-2 text-sm text-gray-600">{text}</span>
        )}
      </div>
    </div>
  );
}
```

### 📄 Componente de Paginação

#### components/Pagination.tsx
```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-md border border-gray-300',
            'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    'px-3 py-2 rounded-md border',
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-md border border-gray-300',
            'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );
}
```

### 🔍 Componente de Search

#### components/SearchInput.tsx
```typescript
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  onSearch,
  placeholder = 'Buscar...',
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  useState(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md',
          'focus:ring-indigo-500 focus:border-indigo-500',
          'placeholder-gray-400'
        )}
      />
    </div>
  );
}

// Hook de debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 🔍 Padrões Avançados

### 🔄 WebSocket Integration

#### hooks/useWebSocket.ts
```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  data: any;
  projectId?: number;
}

export function useWebSocket(projectId?: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    const token = localStorage.getItem('auth-storage');
    const authToken = token ? JSON.parse(token).state.token : null;

    if (!authToken) {
      return;
    }

    socketRef.current = io(wsUrl!, {
      auth: {
        token: authToken,
      },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');

      // Entrar na sala do projeto se especificado
      if (projectId) {
        socket.emit('join-room', { projectId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('message', (message: WebSocketMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('project-updated', (data) => {
      // Lidar com atualizações do projeto
      console.log('Project updated:', data);
    });

    socket.on('task-created', (data) => {
      // Lidar com criação de tarefas
      console.log('Task created:', data);
    });

    socket.on('notification', (data) => {
      // Lidar com notificações em tempo real
      console.log('New notification:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, projectId]);

  const sendMessage = (type: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', { type, data });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', { roomId });
    }
  };

  return {
    isConnected,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
}
```

### 📱 Componente de Real-time Updates

#### components/RealtimeProject.tsx
```typescript
import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useProjectStore } from '@/stores/useProjectStore';
import { useNotification } from './Notifications';

interface RealtimeProjectProps {
  projectId: number;
  children: React.ReactNode;
}

export function RealtimeProject({ projectId, children }: RealtimeProjectProps) {
  const { isConnected, messages } = useWebSocket(projectId);
  const { updateProject, addTask, updateTask } = useProjectStore();
  const { showInfo } = useNotification();

  useEffect(() => {
    messages.forEach((message) => {
      if (message.projectId !== projectId) {
        return;
      }

      switch (message.type) {
        case 'PROJECT_UPDATED':
          updateProject(projectId, message.data);
          showInfo('Projeto atualizado', 'O projeto foi atualizado por outro usuário.');
          break;

        case 'TASK_CREATED':
          addTask(message.data);
          showInfo('Nova tarefa', `Tarefa "${message.data.title}" foi criada.`);
          break;

        case 'TASK_UPDATED':
          updateTask(message.data.id, message.data);
          showInfo('Tarefa atualizada', `Tarefa "${message.data.title}" foi atualizada.`);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    });

    // Limpar mensagens processadas
    if (messages.length > 0) {
      // Implementar lógica para limpar mensagens processadas
    }
  }, [messages, projectId, updateProject, addTask, updateTask, showInfo]);

  return (
    <div className="relative">
      {isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Tempo real</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
```

### 🎯 Custom Hook para API Calls

#### hooks/useApi.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useNotification } from './Notifications';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showError } = useNotification();

  const execute = useCallback(
    async (params?: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await api.get<T>(endpoint, params);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const error = err as Error;
        setError(error);
        options.onError?.(error);
        showError('Erro', err.response?.data?.message || 'Ocorreu um erro inesperado.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, options, showError]
  );

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch: execute,
  };
}

export function useMutation<T = any, V = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showSuccess, showError } = useNotification();

  const mutate = useCallback(
    async (data?: V, options?: { onSuccess?: (result: T) => void; errorMessage?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        let result: T;

        switch (method) {
          case 'POST':
            result = await api.post<T>(endpoint, data);
            break;
          case 'PUT':
            result = await api.put<T>(endpoint, data);
            break;
          case 'PATCH':
            result = await api.patch<T>(endpoint, data);
            break;
          case 'DELETE':
            result = await api.delete<T>(endpoint);
            break;
        }

        showSuccess('Sucesso', 'Operação realizada com sucesso.');
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const error = err as Error;
        setError(error);
        showError(
          'Erro',
          options?.errorMessage || err.response?.data?.message || 'Ocorreu um erro inesperado.'
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method, showSuccess, showError]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}
```

---

## 🆘 Troubleshooting

### 🚨 Problemas Comuns e Soluções

#### 1. CORS Issues
**Problema:** "No 'Access-Control-Allow-Origin' header is present"

**Solução:**
```typescript
// Verificar se backend está configurado corretamente
app.register(fastifyCors, {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Adicionar URL do frontend
  credentials: true,
});
```

#### 2. Token Expiration
**Problema:** Usuário deslogado frequentemente

**Solução:** Implementar refresh automático:
```typescript
// No interceptor do axios
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  try {
    await useAuth.getState().refreshAuth();
    return api(originalRequest);
  } catch {
    useAuth.getState().logout();
  }
}
```

#### 3. WebSocket Connection Issues
**Problema:** WebSocket não conecta

**Solução:**
```typescript
// Verificar configuração do socket
const socket = io(wsUrl, {
  auth: {
    token: authToken, // Token JWT válido
  },
  transports: ['websocket'], // Forçar websocket
});
```

#### 4. Performance Issues
**Problema:** Aplicação lenta com muitos dados

**Solução:** Implementar paginação e lazy loading:
```typescript
// No React Query
const { data, isLoading } = useQuery({
  queryKey: ['projects', page],
  queryFn: () => api.get('/projects', { page, limit: 10 }),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

#### 5. Memory Leaks
**Problema:** Componentes não limpam efeitos

**Solução:** Sempre retornar função de cleanup:
```typescript
useEffect(() => {
  const socket = io();
  
  socket.on('message', handleMessage);
  
  return () => {
    socket.disconnect(); // Cleanup
  };
}, []);
```

### 🔧 Debug Tips

#### 1. Habilitar Debug Logging
```typescript
// Adicionar em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config) => {
    console.log('API Request:', config);
    return config;
  });

  api.interceptors.response.use((response) => {
    console.log('API Response:', response);
    return response;
  });
}
```

#### 2. React Query Devtools
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Seu app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

#### 3. Zustand Devtools
```typescript
// No store
export const useStore = create()(
  devtools(
    (set, get) => ({
      // estado
    }),
    { name: 'store-name' }
  )
);
```

### 📋 Checklists de Debug

#### Checklist de Autenticação
- [ ] Token está sendo armazenado corretamente?
- [ ] Header Authorization está sendo enviado?
- [ ] Interceptor de refresh está funcionando?
- [ ] Backend está validando o token?
- [ ] CORS está configurado para aceitar credenciais?

#### Checklist de API Calls
- [ ] URL da API está correta?
- [ ] Headers estão sendo enviados?
- [ ] Request body está no formato correto?
- [ ] Tratamento de erros está implementado?
- [ ] Loading states estão funcionando?

#### Checklist de WebSocket
- [ ] Servidor WebSocket está rodando?
- [ ] Autenticação do socket está funcionando?
- [ ] Salas estão sendo criadas corretamente?
- [ ] Mensagens estão sendo recebidas?
- [ ] Cleanup está sendo feito ao desmontar?

---

## 🎯 Resumo

Este guia completo fornece tudo o que você precisa para integrar sua aplicação frontend com o Omnity Backend:

1. **📖 Como ler a documentação** - Entenda a estrutura e como interpretar os endpoints
2. **⚙️ Configuração inicial** - Setup do projeto, variáveis de ambiente e dependências
3. **🔐 Autenticação completa** - JWT, refresh tokens, stores e proteção de rotas
4. **📊 Exemplos práticos** - Componentes reais para login, projetos e formulários
5. **🛠️ Client HTTP robusto** - Axios com interceptors e tratamento de erros
6. **🔧 Estado global** - Zustand + React Query para gerenciamento de estado
7. **🚨 Tratamento de erros** - Error boundaries e notificações
8. **📱 Componentes reutilizáveis** - Loading, paginação, search
9. **🔍 Padrões avançados** - WebSocket, real-time updates, hooks customizados
10. **🆘 Troubleshooting** - Problemas comuns e soluções

Com este guia, você tem uma base sólida para construir aplicações frontend modernas e robustas integradas com o Omnity Backend! 🚀