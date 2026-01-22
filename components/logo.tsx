'use client';

import Link from 'next/link';
import { CheckSquare } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className="relative">
        <CheckSquare
          size={iconSizes[size]}
          className="text-primary"
          strokeWidth={2.5}
        />
      </div>
      <span className={`font-bold tracking-tight ${sizeClasses[size]}`}>
        <span className="text-primary">Task</span>
        <span className="text-foreground">Flow</span>
      </span>
    </Link>
  );
}
