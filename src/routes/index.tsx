import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/components/protected-route';

// Layouts
import AuthLayout from '@/pages/auth/Layout';
import AppLayout from '@/pages/app/Layout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// App Pages
import Dashboard from '@/pages/app/Dashboard';
import Projects from '@/pages/app/Projects';
import ProjectDetails from '@/pages/app/projects/Details';
import ProjectCreate from '@/pages/app/projects/Create';
import ProjectEdit from '@/pages/app/projects/Edit';
import Tasks from '@/pages/app/Tasks';
import TaskDetails from '@/pages/app/tasks/Details';
import TaskCreate from '@/pages/app/tasks/Create';
import TaskEdit from '@/pages/app/tasks/Edit';
import Requirements from '@/pages/app/Requirements';
import RequirementDetails from '@/pages/app/requirements/Details';
import RequirementCreate from '@/pages/app/requirements/Create';
import RequirementEdit from '@/pages/app/requirements/Edit';
import Profile from '@/pages/app/Profile';
import Settings from '@/pages/app/Settings';

// Legacy Pages (mantidos por compatibilidade)
import DahsLayout from '@/pages/dahs/Layout';
import DahsHome from '@/pages/dahs/Home';
import DahsAgout from '@/pages/dahs/Agout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas (redirecionam se já estiver autenticado) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* Rotas Protegidas (requerem autenticação) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Projetos */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/edit" element={<ProjectEdit />} />

          {/* Tarefas */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects/:projectId/tasks/new" element={<TaskCreate />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/projects/:projectId/tasks/:taskId/edit" element={<TaskEdit />} />

          {/* Requisitos */}
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/projects/:projectId/requirements/new" element={<RequirementCreate />} />
          <Route path="/requirements/:id" element={<RequirementDetails />} />
          <Route path="/requirements/:id/edit" element={<RequirementEdit />} />

          {/* Perfil e Configurações */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Rotas Legacy (mantidas para compatibilidade) */}
          <Route path="/dahs">
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="home" element={<DahsHome />} />
            <Route path="agout" element={<DahsAgout />} />
          </Route>

          {/* Rota de fallback para área autenticada */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Rota de fallback geral */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}