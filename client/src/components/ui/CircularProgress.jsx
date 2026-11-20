import React from 'react';
import { cn } from '../../utils/cn.js';

export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 7,
  className,
  trackColor = 'stroke-peach-light dark:stroke-peach-dark',
  progressColor = 'stroke-coral',
  showLabel = true,
  labelClassName,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center select-none flex-shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className={cn('transition-colors', trackColor)}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-700 ease-out', progressColor)}
        />
      </svg>

      {/* Center Label */}
      {showLabel && (
        <span
          className={cn(
            'absolute font-bold text-warm-900 dark:text-warm-50 text-base tracking-tight',
            labelClassName
          )}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default CircularProgress;
