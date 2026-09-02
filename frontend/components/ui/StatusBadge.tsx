import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();
  
  let styles = 'bg-slate-800 text-slate-400 border-slate-700'; // Default
  
  if (['OPEN', 'ACTIVE', 'FAILED'].includes(normalized)) {
    styles = 'bg-red-900/50 text-red-400 border-red-700/50';
  } else if (['INVESTIGATING', 'PENDING'].includes(normalized)) {
    styles = 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
  } else if (['RESOLVED', 'CLOSED', 'SUCCESS', 'OK'].includes(normalized)) {
    styles = 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50';
  }

  return (
    <span className={twMerge(clsx('px-2.5 py-0.5 rounded-full text-xs font-semibold border', styles))}>
      {normalized}
    </span>
  );
};