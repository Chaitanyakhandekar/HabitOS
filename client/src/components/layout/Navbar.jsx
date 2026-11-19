import React from 'react';
import { Menu, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Link } from 'react-router-dom';

export const Navbar = ({ openMobile, onQuickAdd }) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-slate-200/80 dark:border-surface-700">
      <div className="flex items-center space-x-3">
        <button
          onClick={openMobile}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-text-secondary dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-text-primary">
            HabitOS
          </span>
        </Link>
      </div>

      {onQuickAdd && (
        <Button size="xs" onClick={onQuickAdd} className="shadow-none">
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Habit
        </Button>
      )}
    </header>
  );
};

export default Navbar;
