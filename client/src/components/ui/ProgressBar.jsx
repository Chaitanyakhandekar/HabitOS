import React from 'react';
import { cn } from '../../utils/cn.js';

export const ProgressBar = ({
  value = 0,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-peach-light dark:bg-surface-700 rounded-full overflow-hidden',
          sizes[size],
          className
        )}
      >
        <div
          className={cn(
            'h-full bg-coral dark:bg-coral-400 rounded-full transition-all duration-300 ease-out',
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
