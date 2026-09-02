import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SeverityBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level }) => {
  const styles = {
    LOW: 'bg-blue-900/50 text-blue-400 border-blue-700/50',
    MEDIUM: 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50',
    HIGH: 'bg-orange-900/50 text-orange-400 border-orange-700/50',
    CRITICAL: 'bg-red-900/50 text-red-400 border-red-700/50',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', styles[level])}>
      {level}
    </span>
  );
};