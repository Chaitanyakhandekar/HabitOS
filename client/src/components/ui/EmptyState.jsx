import React from 'react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-surface-600 bg-slate-50/50 dark:bg-surface-800/40 my-4',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-surface-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800 dark:text-text-primary">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-text-muted mt-1 max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
