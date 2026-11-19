import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 active:translate-y-[1px]',
      secondary:
        'bg-slate-100 dark:bg-surface-700 hover:bg-slate-200 dark:hover:bg-surface-600 text-slate-800 dark:text-text-primary border border-slate-200 dark:border-surface-600',
      outline:
        'border border-slate-300 dark:border-surface-600 hover:bg-slate-100 dark:hover:bg-surface-700 text-slate-700 dark:text-text-secondary',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-surface-700 text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20',
      success:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs rounded-md',
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
      md: 'px-4 py-2 text-sm font-medium rounded-lg',
      lg: 'px-5 py-2.5 text-base font-medium rounded-xl',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:pointer-events-none select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
