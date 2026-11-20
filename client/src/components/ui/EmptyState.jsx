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
        'flex flex-col items-center justify-center p-8 text-center rounded-[24px] border border-dashed border-warm-300 dark:border-surface-600 bg-warm-50/50 dark:bg-surface-800/40 my-4',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-peach-light dark:bg-surface-700 flex items-center justify-center text-coral mb-3 shadow-xs">
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
      )}
      <h4 className="text-base font-bold text-warm-900 dark:text-warm-100">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="shadow-xs shadow-coral/25">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
