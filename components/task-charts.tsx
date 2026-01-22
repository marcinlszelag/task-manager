'use client';

import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskStatusPieChart } from './task-status-pie-chart';
import { TaskActivityChart } from './task-activity-chart';

interface TaskChartsProps {
  tasks: Task[];
}

export function TaskCharts({ tasks }: TaskChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Task Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskStatusPieChart tasks={tasks} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Last 30 Days Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskActivityChart tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
