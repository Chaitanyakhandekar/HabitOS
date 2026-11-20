import React from 'react';
import { cn } from '../../utils/cn.js';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-warm-100 text-warm-700 dark:bg-surface-700 dark:text-warm-300 border border-warm-200 dark:border-surface-600',
    primary: 'bg-coral-50 text-coral-700 dark:bg-coral-950/50 dark:text-coral-300 border border-coral-200 dark:border-coral-800/50',
    peach: 'bg-peach-light text-coral-800 dark:bg-coral-950/60 dark:text-coral-200 border border-coral-200/50',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
