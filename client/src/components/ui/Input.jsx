import React from 'react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-warm-800 dark:text-warm-200 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-warm-400 dark:text-warm-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full py-2.5 text-sm rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/60 dark:border-surface-600 text-warm-900 dark:text-warm-100 placeholder:text-warm-400 dark:placeholder:text-warm-500 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all duration-150',
              leftIcon ? 'pl-10 pr-3.5' : 'px-4',
              rightIcon ? 'pr-10' : '',
              error && 'border-red-500 focus:ring-red-500/25 focus:border-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-warm-400 dark:text-warm-500 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
