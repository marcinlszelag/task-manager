'use client';

import { TaskManager } from '@/components/task-manager';
import { AuthGuard } from '@/components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <TaskManager />
    </AuthGuard>
  );
}
