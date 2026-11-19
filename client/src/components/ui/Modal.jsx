import React, { useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog (Bottom sheet on mobile, centered card on desktop) */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-surface-800 border-t sm:border border-slate-200 dark:border-surface-600 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in my-0 sm:my-8',
          maxWidth
        )}
      >
        {/* Grab bar indicator on mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0.5">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-surface-600" />
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-surface-700">
          <div className="pr-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-text-primary">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
