import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import logsApi from '../../services/logs.api.js';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Sparkles, FastForward, Trash2 } from 'lucide-react';

export const HabitLogModal = ({ isOpen, onClose, habit, existingLog, localDate }) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(
    existingLog ? existingLog.value : habit?.target?.value || 1
  );
  const [note, setNote] = useState(existingLog?.note || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!habit) return null;

  const handleSave = async (status, completionType, customVal = null) => {
    setIsLoading(true);
    try {
      const finalValue = customVal !== null ? customVal : Number(value);
      await logsApi.log({
        habitId: habit._id,
        localDate,
        status,
        value: finalValue,
        completionType,
        note,
      });

      toast.success(
        status === 'completed'
          ? `${habit.name} recorded!`
          : status === 'skipped'
          ? `${habit.name} skipped`
          : `${habit.name} partial progress updated`
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record habit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingLog) return;
    setIsLoading(true);
    try {
      await logsApi.delete(existingLog._id);
      toast.success('Check-in undone');
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['todaySummary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const isNumeric = habit.trackingType !== 'binary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Check-in: ${habit.name}`}
      description={`Record progress for ${localDate}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Habit Target Summary */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-700/50 border border-slate-200/60 dark:border-surface-600/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-text-dim">
              Habit Target
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-text-primary">
              {isNumeric ? `${habit.target.value} ${habit.target.unit}` : 'Binary Completion'}
            </p>
          </div>
          {habit.minimumVersion?.enabled && (
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500">
                Fallback Version
              </span>
              <p className="text-xs font-medium text-slate-600 dark:text-text-secondary">
                {habit.minimumVersion.targetValue} {habit.target.unit}
              </p>
            </div>
          )}
        </div>

        {/* Numeric Input */}
        {isNumeric && (
          <div>
            <Input
              label={`Amount (${habit.target.unit})`}
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        )}

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
            Check-in Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context, reflections, or notes..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-surface-700/60 border border-slate-200 dark:border-surface-600 text-slate-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Completion Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-surface-700">
          <Button
            className="w-full"
            variant="success"
            isLoading={isLoading}
            onClick={() => handleSave('completed', 'full', isNumeric ? Number(value) : 1)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Full Target ({isNumeric ? `${value} ${habit.target.unit}` : 'Done'})
          </Button>

          {habit.minimumVersion?.enabled && (
            <Button
              className="w-full"
              variant="secondary"
              isLoading={isLoading}
              onClick={() =>
                handleSave('completed', 'minimum', habit.minimumVersion.targetValue)
              }
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
              Complete Minimum Version ({habit.minimumVersion.targetValue} {habit.target.unit})
            </Button>
          )}

          <div className="flex space-x-2 pt-1">
            {isNumeric && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isLoading}
                onClick={() => handleSave('partial', 'partial', Number(value))}
              >
                Save Partial
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-slate-500"
              disabled={isLoading}
              onClick={() => handleSave('skipped', 'skip', 0)}
            >
              <FastForward className="w-3.5 h-3.5 mr-1.5" />
              Skip Habit
            </Button>
          </div>
        </div>

        {/* Undo Option */}
        {existingLog && (
          <div className="pt-2 text-center border-t border-slate-100 dark:border-surface-700">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center text-xs text-rose-500 hover:text-rose-600 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Undo and Remove Check-in
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HabitLogModal;
