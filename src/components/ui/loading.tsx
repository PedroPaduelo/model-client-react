import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots';
}

export function Loading({
  size = 'md',
  className,
  text,
  variant = 'spinner'
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerSizeClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  if (variant === 'skeleton') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Skeleton className={cn('h-4 w-full')} />
        <Skeleton className={cn('h-4 w-3/4')} />
        {text && <Skeleton className={cn('h-4 w-1/2')} />}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center', containerSizeClasses[size], className)}>
        <div className="flex space-x-1">
          <div className={cn(
            'bg-primary rounded-full animate-bounce',
            sizeClasses[size]
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            'bg-primary rounded-full animate-bounce',
            sizeClasses[size]
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            'bg-primary rounded-full animate-bounce',
            sizeClasses[size]
          )} style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <span className="text-sm text-muted-foreground ml-2">{text}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', containerSizeClasses[size], className)}>
      <div className="relative">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-muted-foreground border-t-primary',
            sizeClasses[size]
          )}
        />
        {text && (
          <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

// Loading para tabelas
export function TableLoading({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading para cards
export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading inline
export function InlineLoading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

export default Loading;