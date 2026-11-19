import React from 'react';
import { cn } from '../../utils/cn.js';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 border border-slate-200/80 dark:border-surface-700 rounded-xl p-5 shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-surface-700/60', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-base font-semibold text-slate-900 dark:text-text-primary tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-xs text-slate-500 dark:text-text-muted mt-0.5', className)} {...props}>
    {children}
  </p>
);

export default Card;
