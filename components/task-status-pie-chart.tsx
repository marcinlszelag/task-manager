'use client';

import { Task } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskStatusPieChartProps {
  tasks: Task[];
}

const COLORS = ['#22c55e', '#ef4444'];

export function TaskStatusPieChart({ tasks }: TaskStatusPieChartProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const openCount = tasks.length - completedCount;

  const data = [
    { name: 'Completed', value: completedCount },
    { name: 'Open', value: openCount },
  ];

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
