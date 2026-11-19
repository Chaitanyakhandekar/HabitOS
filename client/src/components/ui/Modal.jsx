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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-2xl shadow-2xl z-10 overflow-hidden my-8',
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-surface-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-text-primary">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
