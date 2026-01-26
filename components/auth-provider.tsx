'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User, AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/use-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthTokenResponsePassword['data']>;
  signUp: (email: string, password: string) => Promise<AuthResponse['data']>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
