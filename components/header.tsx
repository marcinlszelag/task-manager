'use client';

import { Button } from '@/components/ui/button';
import { StorageModeSelect } from './storage-mode-select';
import { Logo } from './logo';
import { AppBreadcrumbs, BreadcrumbItem } from './app-breadcrumbs';
import { StorageMode } from '@/types';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  storageMode: StorageMode;
  onStorageModeChange: (mode: StorageMode) => void;
  user: User | null;
  onSignOut: () => void;
  taskCount: number;
  completedCount: number;
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({
  storageMode,
  onStorageModeChange,
  user,
  onSignOut,
  taskCount,
  completedCount,
  breadcrumbs = [],
}: HeaderProps) {
  const modeLabel = storageMode === 'local' ? 'Local' : storageMode === 'notion' ? 'Notion' : 'Supabase';

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {user && storageMode === 'supabase' && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                Sign Out
              </Button>
            </>
          )}
          <StorageModeSelect value={storageMode} onChange={onStorageModeChange} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AppBreadcrumbs items={breadcrumbs} />
        <p className="text-sm text-muted-foreground">
          {taskCount} task{taskCount !== 1 ? 's' : ''} ({completedCount} completed) - {modeLabel}
        </p>
      </div>
    </header>
  );
}
