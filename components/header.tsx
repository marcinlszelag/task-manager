'use client';

import { Button } from '@/components/ui/button';
import { StorageModeSelect } from './storage-mode-select';
import { StorageMode } from '@/types';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  storageMode: StorageMode;
  onStorageModeChange: (mode: StorageMode) => void;
  user: User | null;
  onSignOut: () => void;
  taskCount: number;
  completedCount: number;
}

export function Header({
  storageMode,
  onStorageModeChange,
  user,
  onSignOut,
  taskCount,
  completedCount,
}: HeaderProps) {
  const modeLabel = storageMode === 'local' ? 'Local' : storageMode === 'notion' ? 'Notion' : 'Supabase';

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <div className="flex items-center gap-2">
          {user && storageMode === 'supabase' && (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                Sign Out
              </Button>
            </>
          )}
          <StorageModeSelect value={storageMode} onChange={onStorageModeChange} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {taskCount} task{taskCount !== 1 ? 's' : ''} ({completedCount} completed) - {modeLabel}
      </p>
    </header>
  );
}
