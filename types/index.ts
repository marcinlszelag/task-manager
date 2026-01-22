export interface Task {
  id: string | number;
  text: string;
  completed: boolean;
  description: string;
  deadline: string | null;
  createdAt?: string;
  completedAt?: string | null;
  notionId?: string;
  url?: string;
}

export type StorageMode = 'local' | 'notion' | 'supabase';

export interface User {
  id: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface TasksApiResponse {
  success: boolean;
  tasks?: Task[];
  task?: Task;
  error?: string;
}

export interface SupabaseConfig {
  success: boolean;
  configured: boolean;
  url?: string;
  anonKey?: string;
  message?: string;
}
