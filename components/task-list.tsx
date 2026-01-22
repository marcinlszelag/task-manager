'use client';

import { Task } from '@/types';
import { TaskItem } from './task-item';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onTaskClick: (id: string | number) => void;
}

export function TaskList({ tasks, loading, onToggle, onDelete, onTaskClick }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onClick={onTaskClick}
        />
      ))}
    </div>
  );
}
