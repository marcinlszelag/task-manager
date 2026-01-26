'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StorageMode, Task } from '@/types';
import { useAuthContext } from './auth-provider';
import { useTasks } from '@/hooks/use-tasks';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Header } from './header';
import { TaskForm } from './task-form';
import { TaskList } from './task-list';
import { TaskDetailDialog } from './task-detail-dialog';
import { TaskCharts } from './task-charts';
import { Card, CardContent } from './ui/card';
import { BreadcrumbItem } from './app-breadcrumbs';

export function TaskManager() {
  const [storageMode, setStorageMode] = useState<StorageMode>('supabase');
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const { tasks, loading, addTask, updateTask, toggleComplete, deleteTask, getTask } = useTasks(
    storageMode,
    user
  );

  const selectedTask = selectedTaskId ? getTask(selectedTaskId) : null;

  const handleStorageModeChange = async (mode: StorageMode) => {
    if (mode === 'supabase' && !isSupabaseConfigured()) {
      alert('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }
    setStorageMode(mode);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleTaskClick = (id: string | number) => {
    setSelectedTaskId(id);
    setDialogOpen(true);
  };

  const handleTaskSave = (id: string | number, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const handleTaskDelete = (id: string | number) => {
    deleteTask(id);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  // Compute breadcrumbs based on current view
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Tasks' }];
    return items;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Header
          storageMode={storageMode}
          onStorageModeChange={handleStorageModeChange}
          user={user}
          onSignOut={handleSignOut}
          taskCount={tasks.length}
          completedCount={completedCount}
          breadcrumbs={breadcrumbs}
        />

        <Card>
          <CardContent className="pt-6 space-y-4">
            <TaskForm onAddTask={addTask} />
            <TaskList
              tasks={tasks}
              loading={loading}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onTaskClick={handleTaskClick}
            />
          </CardContent>
        </Card>

        <TaskCharts tasks={tasks} />

        <TaskDetailDialog
          task={selectedTask || null}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      </div>
    </div>
  );
}
