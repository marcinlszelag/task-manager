'use client';

import { Task } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onClick: (id: string | number) => void;
}

export function TaskItem({ task, onToggle, onDelete, onClick }: TaskItemProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group',
        task.completed && 'opacity-60',
        isOverdue && 'border-red-300 bg-red-50 dark:bg-red-950/20'
      )}
      onClick={() => onClick(task.id)}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.text}
        </p>
        {task.deadline && (
          <p
            className={cn(
              'text-xs text-muted-foreground',
              isOverdue && 'text-red-500 font-medium'
            )}
          >
            {formatDeadline(task.deadline)}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        Delete
      </Button>
    </div>
  );
}
