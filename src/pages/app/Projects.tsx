import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Search, Filter, Plus, SortAsc, SortDesc } from 'lucide-react';
import { ProjectStatus, ProjectPriority } from '@/types/api';

export default function Projects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    projects,
    pagination,
    isLoading,
    createProject,
    deleteProject,
    toggleFavorite,
    refetch,
  } = useProjects({
    search: search || undefined,
    status: statusFilter as ProjectStatus || undefined,
    priority: priorityFilter as ProjectPriority || undefined,
    sortBy,
    sortOrder,
    page: 1,
    limit: 12,
  });

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleViewProject = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(id);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ATIVO: return 'bg-green-100 text-green-800';
      case ProjectStatus.PAUSADO: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.CONCLUIDO: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.CANCELADO: return 'bg-red-100 text-red-800';
      case ProjectStatus.EM_ANDAMENTO: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.CRITICA: return 'bg-red-100 text-red-800';
      case ProjectPriority.ALTA: return 'bg-orange-100 text-orange-800';
      case ProjectPriority.MEDIA: return 'bg-yellow-100 text-yellow-800';
      case ProjectPriority.BAIXA: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os seus projetos em um só lugar
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar projetos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value={ProjectStatus.ATIVO}>Ativo</SelectItem>
                <SelectItem value={ProjectStatus.EM_ANDAMENTO}>Em Andamento</SelectItem>
                <SelectItem value={ProjectStatus.PAUSADO}>Pausado</SelectItem>
                <SelectItem value={ProjectStatus.CONCLUIDO}>Concluído</SelectItem>
                <SelectItem value={ProjectStatus.CANCELADO}>Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                <SelectItem value={ProjectPriority.CRITICA}>Crítica</SelectItem>
                <SelectItem value={ProjectPriority.ALTA}>Alta</SelectItem>
                <SelectItem value={ProjectPriority.MEDIA}>Média</SelectItem>
                <SelectItem value={ProjectPriority.BAIXA}>Baixa</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Atualização</SelectItem>
                  <SelectItem value="createdAt">Criação</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="progress">Progresso</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setSortBy('updatedAt');
                setSortOrder('desc');
              }}
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Active Filters */}
          {(search || statusFilter || priorityFilter) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {search && (
                <Badge variant="secondary">
                  Busca: {search}
                </Badge>
              )}
              {statusFilter && (
                <Badge className={getStatusColor(statusFilter as ProjectStatus)}>
                  Status: {statusFilter}
                </Badge>
              )}
              {priorityFilter && (
                <Badge className={getPriorityColor(priorityFilter as ProjectPriority)}>
                  Prioridade: {priorityFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {pagination && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Mostrando {projects.length} de {pagination.total} projetos
            </p>
            <p className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="lg" text="Carregando projetos..." />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum projeto encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {search || statusFilter || priorityFilter
                    ? 'Tente ajustar os filtros ou a busca.'
                    : 'Comece criando seu primeiro projeto.'}
                  </p>
                <Button onClick={handleCreateProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => {
                // Implementar navegação de página
                refetch();
              }}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => {
                // Implementar navegação de página
                refetch();
              }}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}