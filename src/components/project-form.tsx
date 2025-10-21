import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreateProjectRequest, UpdateProjectRequest, ProjectStatus, ProjectPriority } from '@/types/api';
import { X } from 'lucide-react';

const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  stack: z
    .string()
    .min(1, 'Stack é obrigatória')
    .refine(
      (val) => val.split(',').filter(tech => tech.trim()).length > 0,
      'Adicione pelo menos uma tecnologia'
    ),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ATIVO),
  priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIA),
  notes: z.string().max(1000, 'Notas devem ter no máximo 1000 caracteres').optional(),
  gitRepositoryUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: Partial<UpdateProjectRequest>;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Criar Projeto',
  description = 'Preencha os dados abaixo para criar um novo projeto'
}: ProjectFormProps) {
  const [stackInput, setStackInput] = useState('');
  const [stackItems, setStackItems] = useState<string[]>(
    initialData?.stack ? initialData.stack.split(',').map(tech => tech.trim()) : []
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      stack: initialData?.stack || '',
      status: initialData?.status || ProjectStatus.ATIVO,
      priority: initialData?.priority || ProjectPriority.MEDIA,
      notes: initialData?.notes || '',
      gitRepositoryUrl: initialData?.gitRepositoryUrl || '',
    },
  });

  const addStackItem = () => {
    const trimmed = stackInput.trim();
    if (trimmed && !stackItems.includes(trimmed)) {
      const newStackItems = [...stackItems, trimmed];
      setStackItems(newStackItems);
      form.setValue('stack', newStackItems.join(', '));
      setStackInput('');
    }
  };

  const removeStackItem = (item: string) => {
    const newStackItems = stackItems.filter(tech => tech !== item);
    setStackItems(newStackItems);
    form.setValue('stack', newStackItems.join(', '));
  };

  const handleStackInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addStackItem();
    }
  };

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      await onSubmit({
        ...values,
        stack: stackItems.join(', '),
      });
      toast.success('Projeto salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar projeto');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: E-commerce Platform"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente o objetivo e escopo do projeto..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 10 caracteres. Seja específico sobre o que o projeto faz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Stack Tecnológico *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite uma tecnologia e pressione Enter"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  onKeyPress={handleStackInputKeyPress}
                  onBlur={addStackItem}
                />
              </FormControl>
              <FormDescription>
                Adicione as tecnologias utilizadas no projeto (ex: React, Node.js, PostgreSQL)
              </FormDescription>

              {stackItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {stackItems.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeStackItem(tech)}
                        className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="stack"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
              <FormMessage />
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ProjectStatus.ATIVO}>Ativo</SelectItem>
                        <SelectItem value={ProjectStatus.EM_ANDAMENTO}>Em Andamento</SelectItem>
                        <SelectItem value={ProjectStatus.PAUSADO}>Pausado</SelectItem>
                        <SelectItem value={ProjectStatus.CONCLUIDO}>Concluído</SelectItem>
                        <SelectItem value={ProjectStatus.CANCELADO}>Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ProjectPriority.BAIXA}>Baixa</SelectItem>
                        <SelectItem value={ProjectPriority.MEDIA}>Média</SelectItem>
                        <SelectItem value={ProjectPriority.ALTA}>Alta</SelectItem>
                        <SelectItem value={ProjectPriority.CRITICA}>Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gitRepositoryUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repositório Git</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/usuario/projeto"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL do repositório Git (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anotações internas sobre o projeto..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Notas privadas que só você pode ver
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar Projeto'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ProjectForm;