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
        'bg-coral hover:bg-coral-600 text-white shadow-sm shadow-coral/30 active:scale-[0.98] transition-all',
      secondary:
        'bg-peach-light dark:bg-surface-700 hover:bg-coral-100 dark:hover:bg-surface-600 text-coral-800 dark:text-coral-300 border border-coral/15 transition-all',
      outline:
        'border border-warm-300 dark:border-surface-600 hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-700 dark:text-warm-300 transition-all',
      ghost:
        'hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 transition-all',
      danger:
        'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 active:scale-[0.98]',
      success:
        'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98]',
    };

    const sizes = {
      xs: 'px-3 py-1 text-xs rounded-full',
      sm: 'px-4 py-1.5 text-xs font-semibold rounded-full',
      md: 'px-5 py-2.5 text-sm font-semibold rounded-full',
      lg: 'px-6 py-3 text-base font-semibold rounded-full',
      icon: 'p-2.5 rounded-full',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral/40 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
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
