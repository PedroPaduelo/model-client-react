import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useProjects, useFavoriteProjects, useProjectStats } from '@/hooks/use-projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/project-card';
import { Loading } from '@/components/ui/loading';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Plus,
  ExternalLink,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects({ limit: 6 });
  const { projects: favoriteProjects, isLoading: favoritesLoading } = useFavoriteProjects();
  const { stats, isLoading: statsLoading } = useProjectStats();

  if (projectsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {user?.firstName || 'usuário'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Aqui está um resumo dos seus projetos e atividades recentes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalTasks || 0} totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.favorite || 0}</div>
            <p className="text-xs text-muted-foreground">
              Projetos marcados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats?.averageProgress || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Em todos os projetos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <Briefcase className="mr-2 h-4 w-4" />
          Ver Todos os Projetos
        </Button>
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          <Clock className="mr-2 h-4 w-4" />
          Ver Tarefas
        </Button>
      </div>

      {/* Favorite Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Projetos Favoritos</h2>
            <p className="text-sm text-gray-600">
              Seus projetos marcados como favorito
            </p>
          </div>
          {favoriteProjects && favoriteProjects.length > 0 && (
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Ver Todos
            </Button>
          )}
        </div>

        {favoritesLoading ? (
          <Loading text="Carregando projetos favoritos..." />
        ) : favoriteProjects && favoriteProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={(id) => navigate(`/projects/${id}`)}
                onToggleFavorite={() => {/* Implementar se necessário */}}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nenhum projeto favorito
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Marque projetos como favorito para vê-los aqui.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/projects')}
                >
                  Explorar Projetos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Projetos Recentes</h2>
            <p className="text-sm text-gray-600">
              Projetos atualizados recentemente
            </p>
          </div>
          {projects && projects.length > 0 && (
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Ver Todos
            </Button>
          )}
        </div>

        {projectsLoading ? (
          <Loading text="Carregando projetos recentes..." />
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={(id) => navigate(`/projects/${id}`)}
                onToggleFavorite={() => {/* Implementar se necessário */}}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nenhum projeto ainda
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando seu primeiro projeto.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/projects/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}