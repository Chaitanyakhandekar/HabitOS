import React from 'react';
import { cn } from '../../utils/cn.js';

export const Select = React.forwardRef(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-surface-700/60 border border-slate-200 dark:border-surface-600 text-slate-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150',
            error && 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
