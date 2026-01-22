'use client';

import { useState, useEffect, useMemo } from 'react';
import { StorageMode, Task } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Header } from './header';
import { TaskForm } from './task-form';
import { TaskList } from './task-list';
import { TaskDetailDialog } from './task-detail-dialog';
import { AuthForm } from './auth-form';
import { TaskCharts } from './task-charts';
import { Card, CardContent } from './ui/card';
import { BreadcrumbItem } from './app-breadcrumbs';

export function TaskManager() {
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [showAuth, setShowAuth] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { tasks, loading, addTask, updateTask, toggleComplete, deleteTask, getTask } = useTasks(
    storageMode,
    user
  );

  const selectedTask = selectedTaskId ? getTask(selectedTaskId) : null;

  const handleStorageModeChange = async (mode: StorageMode) => {
    // Both Supabase and Notion modes require authentication
    if (mode === 'supabase' || mode === 'notion') {
      if (mode === 'supabase' && !isSupabaseConfigured()) {
        alert('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
        return;
      }
      if (!user) {
        setShowAuth(true);
        setStorageMode(mode);
        return;
      }
    }
    setStorageMode(mode);
    setShowAuth(false);
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    setShowAuth(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    const data = await signUp(email, password);
    if (data.session) {
      setShowAuth(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setStorageMode('local');
  };

  const handleSkipAuth = () => {
    setStorageMode('local');
    setShowAuth(false);
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

  // Check auth on mount for supabase and notion modes
  useEffect(() => {
    if ((storageMode === 'supabase' || storageMode === 'notion') && !authLoading && !user) {
      setShowAuth(true);
    }
  }, [storageMode, authLoading, user]);

  // Hide auth form when user logs in
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
    }
  }, [user, showAuth]);

  const completedCount = tasks.filter((t) => t.completed).length;

  // Compute breadcrumbs based on current view
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Tasks' }];
    return items;
  }, []);

  if (showAuth && (storageMode === 'supabase' || storageMode === 'notion')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} onSkip={handleSkipAuth} />
      </div>
    );
  }

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
