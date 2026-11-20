import React from 'react';
import { cn } from '../../utils/cn.js';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-800 border border-warm-200/70 dark:border-surface-700/60 rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(40,25,20,0.03)] transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between pb-3 mb-3 border-b border-warm-100 dark:border-surface-700/60', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-base font-bold text-warm-900 dark:text-warm-100 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-xs text-warm-500 dark:text-warm-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export default Card;
