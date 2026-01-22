'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, StorageMode } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const TASKS_STORAGE_KEY = 'tasks';

export function useTasks(storageMode: StorageMode, user: User | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Load tasks from localStorage
  const loadLocalTasks = useCallback(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks([]);
    }
  }, []);

  // Save tasks to localStorage
  const saveLocalTasks = useCallback((newTasks: Task[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  // Load tasks from Notion
  const loadNotionTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        throw new Error(data.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks from Supabase
  const loadSupabaseTasks = useCallback(async () => {
    if (!supabase || !user) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedTasks: Task[] = (data || []).map((item) => ({
        id: item.id,
        text: item.title,
        completed: item.completed || false,
        description: item.description || '',
        deadline: item.deadline || null,
      }));

      setTasks(mappedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Load tasks based on storage mode
  const loadTasks = useCallback(async () => {
    if (storageMode === 'local') {
      loadLocalTasks();
    } else if (storageMode === 'notion') {
      await loadNotionTasks();
    } else if (storageMode === 'supabase') {
      await loadSupabaseTasks();
    }
  }, [storageMode, loadLocalTasks, loadNotionTasks, loadSupabaseTasks]);

  // Add a new task
  const addTask = useCallback(async (text: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
      description: '',
      deadline: null,
    };

    if (storageMode === 'local') {
      const newTasks = [newTask, ...tasks];
      setTasks(newTasks);
      saveLocalTasks(newTasks);
    } else if (storageMode === 'notion') {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, completed: false, description: '', deadline: null }),
        });
        const data = await response.json();
        if (data.success) {
          await loadNotionTasks();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add task');
      }
    } else if (storageMode === 'supabase' && supabase && user) {
      try {
        const { error: insertError } = await supabase
          .from('todos')
          .insert([{
            title: text,
            completed: false,
            description: '',
            deadline: null,
            user_id: user.id,
          }]);

        if (insertError) throw insertError;
        await loadSupabaseTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add task');
      }
    }
  }, [storageMode, tasks, saveLocalTasks, loadNotionTasks, loadSupabaseTasks, supabase, user]);

  // Update a task
  const updateTask = useCallback(async (id: string | number, updates: Partial<Task>) => {
    if (storageMode === 'local') {
      const newTasks = tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      setTasks(newTasks);
      saveLocalTasks(newTasks);
    } else if (storageMode === 'notion') {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (data.success) {
          await loadNotionTasks();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task');
      }
    } else if (storageMode === 'supabase' && supabase) {
      try {
        const updateData: Record<string, unknown> = {};
        if (updates.text !== undefined) updateData.title = updates.text;
        if (updates.completed !== undefined) updateData.completed = updates.completed;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.deadline !== undefined) updateData.deadline = updates.deadline;

        const { error: updateError } = await supabase
          .from('todos')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;
        await loadSupabaseTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task');
      }
    }
  }, [storageMode, tasks, saveLocalTasks, loadNotionTasks, loadSupabaseTasks, supabase]);

  // Toggle task completion
  const toggleComplete = useCallback(async (id: string | number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateTask(id, { completed: !task.completed });
  }, [tasks, updateTask]);

  // Delete a task
  const deleteTask = useCallback(async (id: string | number) => {
    if (storageMode === 'local') {
      const newTasks = tasks.filter((t) => t.id !== id);
      setTasks(newTasks);
      saveLocalTasks(newTasks);
    } else if (storageMode === 'notion') {
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          await loadNotionTasks();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
      }
    } else if (storageMode === 'supabase' && supabase) {
      try {
        const { error: deleteError } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        await loadSupabaseTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
      }
    }
  }, [storageMode, tasks, saveLocalTasks, loadNotionTasks, loadSupabaseTasks, supabase]);

  // Get a specific task
  const getTask = useCallback((id: string | number): Task | undefined => {
    return tasks.find((t) => String(t.id) === String(id));
  }, [tasks]);

  // Load tasks when storage mode or user changes
  useEffect(() => {
    if (storageMode === 'supabase' && !user) {
      setTasks([]);
      return;
    }
    loadTasks();
  }, [storageMode, user, loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    getTask,
    loadTasks,
  };
}
