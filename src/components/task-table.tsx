import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Task,
  TaskStatus,
} from '@/types/api';
import {
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  RotateCcw,
} from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  isLoading?: boolean;
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
}

export function TaskTable({
  tasks,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.CONCLUIDA:
        return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.EM_PROGRESSO:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.EM_REVISAO:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case TaskStatus.BLOQUEADA:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskStatus.PENDENTE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.CONCLUIDA:
        return <CheckCircle className="h-4 w-4" />;
      case TaskStatus.EM_PROGRESSO:
        return <PlayCircle className="h-4 w-4" />;
      case TaskStatus.EM_REVISAO:
        return <Clock className="h-4 w-4" />;
      case TaskStatus.BLOQUEADA:
        return <Ban className="h-4 w-4" />;
      case TaskStatus.PENDENTE:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusActions = (status: TaskStatus, taskId: number) => {
    const actions = [];

    switch (status) {
      case TaskStatus.PENDENTE:
        actions.push({
          label: 'Iniciar Progresso',
          icon: <PlayCircle className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.EM_PROGRESSO),
        });
        break;

      case TaskStatus.EM_PROGRESSO:
        actions.push({
          label: 'Pausar',
          icon: <PauseCircle className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.PENDENTE),
        });
        actions.push({
          label: 'Enviar para Revisão',
          icon: <Clock className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.EM_REVISAO),
        });
        break;

      case TaskStatus.EM_REVISAO:
        actions.push({
          label: 'Revisar Aprovado',
          icon: <CheckCircle className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.CONCLUIDA),
        });
        actions.push({
          label: 'Revisar Reprovado',
          icon: <RotateCcw className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.EM_PROGRESSO),
        });
        break;

      case TaskStatus.BLOQUEADA:
        actions.push({
          label: 'Desbloquear',
          icon: <PlayCircle className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.EM_PROGRESSO),
        });
        break;

      case TaskStatus.CONCLUIDA:
        actions.push({
          label: 'Reabrir',
          icon: <RotateCcw className="h-4 w-4" />,
          action: () => onStatusChange?.(taskId, TaskStatus.EM_PROGRESSO),
        });
        break;
    }

    return actions;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma tarefa</h3>
        <p className="mt-1 text-sm text-gray-500">
          Não há tarefas para mostrar neste projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            {selectedTasks.length} tarefa(s) selecionada(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Marcar como Concluída
            </Button>
            <Button variant="outline" size="sm">
              Excluir Selecionadas
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Atualizada em</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {task.taskDescription}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)} variant="outline">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(task.status)}
                      <span>{task.status}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: task.todos
                            ? `${Math.round((task.todos.filter(todo => todo.is_completed).length / task.todos.length) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[3rem]">
                      {task.todos
                        ? `${task.todos.filter(todo => todo.is_completed).length}/${task.todos.length}`
                        : '0/0'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(task)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      {getStatusActions(task.status, task.id).map((action, index) => (
                        <DropdownMenuItem key={index} onClick={action.action}>
                          {action.icon}
                          <span className="ml-2">{action.label}</span>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(task.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
          <span className="text-sm text-gray-600">
            {selectedTasks.length} tarefa(s) selecionada(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTasks([])}
          >
            Limpar Seleção
          </Button>
        </div>
      )}
    </div>
  );
}

export default TaskTable;