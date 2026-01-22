'use client';

import { useMemo } from 'react';
import { Task } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TaskActivityChartProps {
  tasks: Task[];
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskActivityChart({ tasks }: TaskActivityChartProps) {
  const chartData = useMemo(() => {
    const last30Days = getLast30Days();

    // Count tasks created and completed per day
    const createdByDay: Record<string, number> = {};
    const completedByDay: Record<string, number> = {};

    // Initialize all days with 0
    last30Days.forEach((day) => {
      createdByDay[day] = 0;
      completedByDay[day] = 0;
    });

    // Count created tasks
    tasks.forEach((task) => {
      if (task.createdAt) {
        const day = task.createdAt.split('T')[0];
        if (createdByDay[day] !== undefined) {
          createdByDay[day]++;
        }
      }
    });

    // Count completed tasks
    tasks.forEach((task) => {
      if (task.completedAt) {
        const day = task.completedAt.split('T')[0];
        if (completedByDay[day] !== undefined) {
          completedByDay[day]++;
        }
      }
    });

    return last30Days.map((day) => ({
      date: day,
      label: formatDateLabel(day),
      created: createdByDay[day],
      completed: completedByDay[day],
    }));
  }, [tasks]);

  const hasData = chartData.some((d) => d.created > 0 || d.completed > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No activity in the last 30 days
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar dataKey="created" name="Created" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="completed" name="Completed" fill="#22c55e" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
