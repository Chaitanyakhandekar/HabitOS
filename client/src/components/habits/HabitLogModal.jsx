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
        localDate: localDate || new Date().toISOString().slice(0, 10),
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
      title={habit.name}
      description={`Record progress for ${localDate || 'today'}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Numeric value control */}
        {isNumeric && (
          <div className="p-4 rounded-2xl bg-peach-light/50 dark:bg-surface-700/50 border border-coral/15 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-warm-800 dark:text-warm-200">
              <span>Current Progress</span>
              <span>Target: {habit.target?.value} {habit.target?.unit}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-lg font-bold text-center"
              />
              <span className="text-xs font-bold text-warm-500 uppercase">
                {habit.target?.unit}
              </span>
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-warm-800 dark:text-warm-200 mb-1.5">
            Check-in Note (Optional)
          </label>
          <input
            type="text"
            placeholder="How did it feel?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-full bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2.5 pt-2">
          {/* Full Completion */}
          <Button
            onClick={() =>
              handleSave(
                'completed',
                'full',
                isNumeric ? Number(value) : habit.target?.value || 1
              )
            }
            isLoading={isLoading}
            className="w-full py-3"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Full Target
          </Button>

          {/* Minimum version if configured */}
          {habit.minVersion?.enabled && (
            <Button
              variant="secondary"
              onClick={() =>
                handleSave(
                  'completed',
                  'minimum',
                  habit.minVersion.target
                )
              }
              isLoading={isLoading}
              className="w-full py-2.5"
            >
              <Sparkles className="w-4 h-4 mr-2 text-coral" />
              Minimum Version ({habit.minVersion.target} {habit.target?.unit})
            </Button>
          )}

          {/* Skip option */}
          <Button
            variant="ghost"
            onClick={() => handleSave('skipped', 'skipped', 0)}
            isLoading={isLoading}
            className="w-full py-2 text-warm-500"
          >
            <FastForward className="w-4 h-4 mr-2" />
            Skip (Rest Day / Planned)
          </Button>

          {/* Undo if existing */}
          {existingLog && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center justify-center py-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Undo / Delete Check-in
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HabitLogModal;
