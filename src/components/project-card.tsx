import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Project, ProjectStatus, ProjectPriority } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Star,
  StarIcon,
  MoreHorizontal,
  Calendar,
  Package,
  CheckCircle,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
  onToggleFavorite?: (projectId: number) => void;
  onViewDetails?: (projectId: number) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewDetails
}: ProjectCardProps) {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ATIVO:
        return 'bg-green-100 text-green-800 border-green-200';
      case ProjectStatus.PAUSADO:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ProjectStatus.CONCLUIDO:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ProjectStatus.CANCELADO:
        return 'bg-red-100 text-red-800 border-red-200';
      case ProjectStatus.EM_ANDAMENTO:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.CRITICA:
        return 'bg-red-100 text-red-800 border-red-200';
      case ProjectPriority.ALTA:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ProjectPriority.MEDIA:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ProjectPriority.BAIXA:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-yellow-50"
                onClick={() => onToggleFavorite?.(project.id)}
              >
                {project.isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-400" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(project.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={getStatusColor(project.status)} variant="outline">
            {project.status}
          </Badge>
          <Badge className={getPriorityColor(project.priority)} variant="outline">
            {project.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progresso</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress
            value={project.progress}
            className="h-2"
            indicatorClassName={getProgressColor(project.progress)}
          />
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{project.taskCount || 0} tarefas</span>
            {project.completedTaskCount && project.completedTaskCount > 0 && (
              <span className="text-green-600">
                · {project.completedTaskCount} concluídas
              </span>
            )}
          </p>

          {project.requirementCount && project.requirementCount > 0 && (
            <p className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>{project.requirementCount} requisitos</span>
            </p>
          )}

          <p className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              Criado em {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </p>
        </div>

        {project.stack && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Stack:</p>
            <div className="flex flex-wrap gap-1">
              {project.stack.split(',').map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewDetails?.(project.id)}
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}

// Componente para grid de projetos
interface ProjectGridProps {
  projects: Project[];
  isLoading?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
  onToggleFavorite?: (projectId: number) => void;
  onViewDetails?: (projectId: number) => void;
}

export function ProjectGrid({
  projects,
  isLoading,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewDetails
}: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum projeto</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece criando seu primeiro projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

export default ProjectCard;