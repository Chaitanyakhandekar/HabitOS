import React from 'react';
import { cn } from '../../utils/cn.js';

export const Select = React.forwardRef(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-warm-800 dark:text-warm-200 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 text-sm rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/60 dark:border-surface-600 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all duration-150',
            error && 'border-red-500 focus:ring-red-500/25 focus:border-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
