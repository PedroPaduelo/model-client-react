# 📚 Documentação da API no Frontend

Este documento explica como usar a integração com a API Omnity Backend na aplicação frontend.

## 🚀 Sumário

1. [Estrutura do Projeto](#-estrutura-do-projeto)
2. [Configuração Inicial](#-configuração-inicial)
3. [Autenticação](#-autenticação)
4. [Hooks de API](#-hooks-de-api)
5. [Componentes Reutilizáveis](#-componentes-reutilizáveis)
6. [WebSocket em Tempo Real](#-websocket-em-tempo-real)
7. [Tratamento de Erros](#-tratamento-de-erros)
8. [Exemplos Práticos](#-exemplos-práticos)

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── providers/          # Provedores React
│   │   ├── app-provider.tsx
│   │   ├── auth-provider.tsx
│   │   └── query-provider.tsx
│   ├── ui/                 # Componentes UI (shadcn/ui)
│   ├── protected-route.tsx # Proteção de rotas
│   ├── project-card.tsx    # Card de projeto
│   ├── project-form.tsx    # Formulário de projeto
│   └── task-table.tsx      # Tabela de tarefas
├── hooks/
│   ├── use-auth.ts         # Hook de autenticação
│   ├── use-projects.ts     # Hook de projetos
│   ├── use-tasks.ts        # Hook de tarefas
│   ├── use-requirements.ts # Hook de requisitos
│   └── use-websocket.ts    # Hook de WebSocket
├── stores/
│   ├── auth-store.ts       # Zustand store de autenticação
│   └── notification-store.ts # Store de notificações
├── types/
│   └── api.ts              # Tipos TypeScript da API
├── lib/
│   ├── api.ts              # Cliente HTTP
│   └── query-client.ts     # Configuração React Query
└── pages/
    ├── app/                # Páginas autenticadas
    └── auth/               # Páginas de autenticação
```

---

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL da API Backend
VITE_API_URL=http://localhost:3000

# URL do WebSocket
VITE_WS_URL=ws://localhost:3000

# Ambiente
VITE_ENV=development
```

### 2. Configuração do App Provider

Envolva sua aplicação com os provedores necessários:

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/components/providers/app-provider'
import AppRoutes from '@/routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## 🔐 Autenticação

### Login de Usuário

```tsx
import { useLogin } from '@/hooks/use-auth';
import { useState } from 'react';

function LoginForm() {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // Erro já é tratado automaticamente
      console.error('Login falhou:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  );
}
```

### Verificação de Autenticação

```tsx
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Bem-vindo, {user?.firstName}!</h1>
        {/* Conteúdo do dashboard */}
      </div>
    </ProtectedRoute>
  );
}
```

### Logout

```tsx
import { useLogout } from '@/hooks/use-auth';

function LogoutButton() {
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    // Redirecionamento automático para login
  };

  return <button onClick={handleLogout}>Sair</button>;
}
```

---

## 🎣 Hooks de API

### Gestão de Projetos

```tsx
import { useProjects, useCreateProject } from '@/hooks/use-projects';

function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    refetch,
  } = useProjects({
    page: 1,
    limit: 10,
    status: 'Ativo',
  });

  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (projectData) => {
    try {
      await createProjectMutation.mutateAsync(projectData);
      refetch(); // Atualiza lista
    } catch (error) {
      // Erro tratado automaticamente
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar projetos</div>;

  return (
    <div>
      <h1>Projetos</h1>
      {/* Lista de projetos */}
    </div>
  );
}
```

### Gestão de Tarefas

```tsx
import { useTasks, useCreateTask } from '@/hooks/use-tasks';

function TasksPage({ projectId }: { projectId: number }) {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(projectId);

  const handleCreateTask = async (taskData) => {
    await createTask(taskData);
  };

  const handleUpdateStatus = async (taskId: number, status: TaskStatus) => {
    await updateTask({ id: taskId, data: { status } });
  };

  return (
    <div>
      <h1>Tarefas do Projeto</h1>
      {/* Componente de tabela de tarefas */}
    </div>
  );
}
```

### Gestão de Requisitos

```tsx
import { useRequirements } from '@/hooks/use-requirements';

function RequirementsPage({ projectId }: { projectId: number }) {
  const {
    requirements,
    isLoading,
    createRequirement,
    updateRequirement,
  } = useRequirements(projectId);

  return (
    <div>
      <h1>Requisitos</h1>
      {/* Lista de requisitos */}
    </div>
  );
}
```

---

## 🧩 Componentes Reutilizáveis

### ProjectCard

```tsx
import { ProjectCard } from '@/components/project-card';

function ProjectList() {
  const { projects } = useProjects();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={(id) => navigate(`/projects/${id}`)}
          onEdit={(project) => editProject(project)}
          onDelete={(id) => deleteProject(id)}
          onToggleFavorite={(id) => toggleFavorite(id)}
        />
      ))}
    </div>
  );
}
```

### ProjectForm

```tsx
import { ProjectForm } from '@/components/project-form';
import { useCreateProject } from '@/hooks/use-projects';

function CreateProjectPage() {
  const createProject = useCreateProject();
  const navigate = useNavigate();

  return (
    <ProjectForm
      title="Criar Novo Projeto"
      onSubmit={async (data) => {
        await createProject.mutateAsync(data);
        navigate('/projects');
      }}
      onCancel={() => navigate('/projects')}
    />
  );
}
```

### TaskTable

```tsx
import { TaskTable } from '@/components/task-table';

function TasksList({ projectId }: { projectId: number }) {
  const { tasks } = useTasks(projectId);

  return (
    <TaskTable
      tasks={tasks}
      onView={(task) => navigate(`/tasks/${task.id}`)}
      onEdit={(task) => editTask(task)}
      onDelete={(id) => deleteTask(id)}
      onStatusChange={(id, status) => updateTaskStatus(id, status)}
    />
  );
}
```

---

## 🔄 WebSocket em Tempo Real

### Configuração Básica

```tsx
import { useWebSocket } from '@/hooks/use-websocket';

function ProjectDetails({ projectId }: { projectId: number }) {
  const {
    isConnected,
    messages,
    connectionStatus,
    sendMessage,
  } = useWebSocket({ projectId });

  // Ouvir mensagens específicas
  useProjectMessage('task-created', (data) => {
    console.log('Nova tarefa criada:', data);
    // Atualizar UI
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>{connectionStatus}</span>
      </div>
      {/* Conteúdo do projeto */}
    </div>
  );
}
```

### Eventos Customizados

```tsx
import { useEffect } from 'react';

function useProjectMessage(eventType: string, callback: (data: any) => void) {
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail.type === eventType) {
        callback(event.detail.data);
      }
    };

    window.addEventListener('websocket-message', handleCustomEvent);

    return () => {
      window.removeEventListener('websocket-message', handleCustomEvent);
    };
  }, [eventType, callback]);
}
```

---

## ⚠️ Tratamento de Erros

### Tratamento Global

O sistema já possui tratamento global de erros configurado:

```tsx
// Em hooks, os erros são tratados automaticamente
const createProjectMutation = useMutation({
  mutationFn: createProject,
  onError: (error) => {
    // Erro já é exibido via toast automaticamente
    console.error('Erro ao criar projeto:', error);
  },
});
```

### Tratamento Local

```tsx
import { handleApiError } from '@/lib/api';

function handleApiCall() {
  try {
    await api.post('/projects', data);
  } catch (error) {
    const apiError = handleApiError(error);

    // Tratar erros específicos
    switch (apiError.statusCode) {
      case 401:
        // Redirecionar para login
        break;
      case 403:
        // Mostrar erro de permissão
        break;
      case 429:
        // Mostrar erro de rate limit
        break;
      default:
        // Erro genérico
        break;
    }
  }
}
```

---

## 💡 Exemplos Práticos

### 1. Dashboard Completo

```tsx
import { useProjects, useFavoriteProjects, useProjectStats } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';

function Dashboard() {
  const { projects, isLoading } = useProjects({ limit: 6 });
  const { projects: favoriteProjects } = useFavoriteProjects();
  const { stats } = useProjectStats();
  const { tasks } = useTasks(1); // ID do projeto principal

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        {/* Mais cards de estatísticas */}
      </div>

      {/* Projetos favoritos */}
      <div>
        <h2>Projetos Favoritos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {favoriteProjects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      </div>

      {/* Tarefas recentes */}
      <div>
        <h2>Tarefas Recentes</h2>
        <TaskTable
          tasks={tasks?.slice(0, 5) || []}
          onView={(task) => navigate(`/tasks/${task.id}`)}
        />
      </div>
    </div>
  );
}
```

### 2. Página de Detalhes do Projeto

```tsx
function ProjectDetailsPage() {
  const { id } = useParams();
  const projectId = parseInt(id!);

  const { project, isLoading, updateProject } = useProject(projectId);
  const { tasks, createTask } = useTasks(projectId);
  const { requirements, createRequirement } = useRequirements(projectId);
  const { isConnected } = useWebSocket({ projectId });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header do projeto */}
      <div>
        <h1>{project?.name}</h1>
        <p>{project?.description}</p>

        <div className="flex items-center gap-2">
          <Badge>{project?.status}</Badge>
          <Badge variant="outline">{project?.priority}</Badge>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50">
              Tempo real
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs com conteúdo */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="requirements">Requisitos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <Button onClick={() => {/* Abrir modal de criação */ }}>
              Nova Tarefa
            </Button>
            <TaskTable
              tasks={tasks}
              onStatusChange={(id, status) => updateTaskStatus(id, status)}
            />
          </div>
        </TabsContent>

        <TabsContent value="requirements">
          <div className="space-y-4">
            <Button onClick={() => {/* Abrir modal de criação */ }}>
              Novo Requisito
            </Button>
            {/* Lista de requisitos */}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <ProjectForm
            initialData={project}
            onSubmit={updateProject}
            title="Editar Projeto"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. Busca e Filtros Avançados

```tsx
function ProjectsWithFilters() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    favorite: false,
  });

  const { projects, isLoading, refetch } = useProjects({
    search: filters.search || undefined,
    status: filters.status as ProjectStatus || undefined,
    priority: filters.priority as ProjectPriority || undefined,
    favorite: filters.favorite || undefined,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    refetch();
  }, [debouncedSearch, filters.status, filters.priority, filters.favorite]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Buscar projetos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite"
                checked={filters.favorite}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, favorite: !!checked })
                }
              />
              <Label htmlFor="favorite">Apenas favoritos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <ProjectGrid
        projects={projects}
        isLoading={isLoading}
        onViewDetails={(id) => navigate(`/projects/${id}`)}
      />
    </div>
  );
}
```

---

## 🔧 Boas Práticas

### 1. Tipagem Forte

Sempre utilize os tipos definidos em `src/types/api.ts`:

```tsx
// ✅ Correto
const createProject = async (data: CreateProjectRequest) => {
  // ...
};

// ❌ Evitar
const createProject = async (data: any) => {
  // ...
};
```

### 2. Tratamento de Loading

Sempre utilize os estados de loading dos hooks:

```tsx
const { projects, isLoading } = useProjects();

if (isLoading) {
  return <Loading />;
}
```

### 3. Tratamento de Erros

Confie no tratamento automático de erros, mas implemente fallbacks quando necessário:

```tsx
const { projects, error } = useProjects();

if (error) {
  return <ErrorMessage error={error} />;
}
```

### 4. Cache e Otimização

O React Query gerencia cache automaticamente, mas você pode invalidar manualmente:

```tsx
const createProject = useCreateProject();

const handleCreate = async (data: CreateProjectRequest) => {
  await createProject.mutateAsync(data);

  // Invalida queries relacionadas se necessário
  queryClient.invalidateQueries({ queryKey: ['project-stats'] });
};
```

### 5. Componentes Reutilizáveis

Aproveite os componentes criados e estenda-os conforme necessário:

```tsx
// Componente customizado baseado no ProjectCard
function ProjectCardCompact({ project }: { project: Project }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <Badge>{project.status}</Badge>
    </div>
  );
}
```

---

## 🚀 Próximos Passos

1. **Explore os componentes** existentes em `src/components/`
2. **Crie novas pages** seguindo os padrões estabelecidos
3. **Estenda os hooks** para funcionalidades específicas
4. **Implemente testes** para os componentes e hooks
5. **Configure monitoramento** para erros e performance

---

Esta documentação serve como guia completo para integrar e utilizar a API Omnity Backend na aplicação frontend. Para dúvidas adicionais, consulte o código-fonte ou a equipe de desenvolvimento.