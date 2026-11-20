import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  Edit,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import goalsApi from '../services/goals.api.js';
import habitsApi from '../services/habits.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export const GoalsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);

  // Quick progress modal state
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    goal: null,
    amount: 1,
  });

  // Fetch goals
  const { data: goalsRes, isLoading } = useQuery({
    queryKey: ['goals', statusFilter],
    queryFn: () => goalsApi.getAll({ status: statusFilter }),
  });

  // Fetch habits for linking
  const { data: habitsRes } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitsApi.getAll(),
  });

  const goals = goalsRes?.data?.goals || [];
  const habits = habitsRes?.data?.habits || [];

  // Goal Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitId, setHabitId] = useState('');
  const [target, setTarget] = useState(10);
  const [unit, setUnit] = useState('times');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const openCreateModal = () => {
    setGoalToEdit(null);
    setTitle('');
    setDescription('');
    setHabitId('');
    setTarget(10);
    setUnit('times');
    setStartDate(new Date().toISOString().slice(0, 10));
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setGoalToEdit(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setHabitId(goal.habitId?._id || goal.habitId || '');
    setTarget(goal.target);
    setUnit(goal.unit || 'times');
    setStartDate(goal.startDate);
    setDeadline(goal.deadline);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        habitId: habitId || null,
        target: Number(target),
        unit,
        startDate,
        deadline,
      };

      if (goalToEdit) {
        await goalsApi.update(goalToEdit._id, payload);
        toast.success('Goal updated');
      } else {
        await goalsApi.create(payload);
        toast.success('Goal created');
      }

      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save goal');
    }
  };

  const handleProgressUpdate = async () => {
    if (!progressModal.goal) return;
    try {
      const newProgress = Math.max(0, (progressModal.goal.progress || 0) + Number(progressModal.amount));
      await goalsApi.update(progressModal.goal._id, { progress: newProgress });
      toast.success('Goal progress updated!');
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setProgressModal({ isOpen: false, goal: null, amount: 1 });
    } catch (err) {
      toast.error(err.message || 'Failed to update progress');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsApi.delete(id);
        toast.success('Goal deleted');
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      } catch (err) {
        toast.error(err.message || 'Failed to delete goal');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Goals & Milestones
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Set ambitious targets linked directly to daily habit routines or independent milestones.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-xs shadow-coral/30">
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Create Goal
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-full p-1 w-fit shadow-xs">
        {['active', 'completed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-150',
              statusFilter === status
                ? 'bg-coral text-white shadow-xs'
                : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-surface-700'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-warm-400 animate-pulse">
          Loading goals...
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description="Create your first milestone to channel your daily habits into measurable achievements."
          actionLabel="Create Goal"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.round(((goal.progress || 0) / goal.target) * 100)
            );
            const isCompleted = goal.status === 'completed' || percentage >= 100;

            return (
              <Card
                key={goal._id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow rounded-[24px] p-5"
              >
                <div>
                  {/* Status & Habit badge */}
                  <div className="flex items-center justify-between">
                    {goal.habitId ? (
                      <Badge variant="peach" className="text-[10px]">
                        Linked: {goal.habitId.name || 'Habit'}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px]">
                        Independent Goal
                      </Badge>
                    )}

                    <Badge variant={isCompleted ? 'success' : 'primary'}>
                      {isCompleted ? 'Achieved' : 'In Progress'}
                    </Badge>
                  </div>

                  {/* Title and Description */}
                  <div className="mt-3.5">
                    <h3 className="text-base font-bold text-warm-900 dark:text-warm-100">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 line-clamp-2 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Numerical Target */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-warm-700 dark:text-warm-300">
                        {goal.progress || 0} / {goal.target} {goal.unit}
                      </span>
                      <span className="text-coral font-extrabold">
                        {percentage}%
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      barClassName={isCompleted ? 'bg-emerald-500' : 'bg-coral'}
                    />
                  </div>

                  {/* Deadline info */}
                  <div className="flex items-center space-x-1.5 text-xs text-warm-400 mt-3.5">
                    <Clock className="w-3.5 h-3.5 text-coral" />
                    <span>Deadline: {goal.deadline}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3.5 border-t border-warm-100 dark:border-surface-700/60 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() =>
                      setProgressModal({
                        isOpen: true,
                        goal,
                        amount: 1,
                      })
                    }
                  >
                    + Log Progress
                  </Button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 rounded-full text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100 dark:hover:bg-surface-700 transition-colors"
                      title="Edit Goal"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 rounded-full text-warm-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={goalToEdit ? 'Edit Goal' : 'Create Goal'}
        description="Define target parameters, milestone metrics, and deadlines."
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 12 Books"
            required
          />

          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key milestones or details..."
          />

          <Select
            label="Associated Habit (Optional)"
            value={habitId}
            onChange={(e) => setHabitId(e.target.value)}
          >
            <option value="">None (Independent Milestone)</option>
            {habits.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.category})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Amount"
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
            <Input
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. books, km, hrs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {goalToEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Progress Increment Modal */}
      <Modal
        isOpen={progressModal.isOpen}
        onClose={() => setProgressModal({ isOpen: false, goal: null, amount: 1 })}
        title={`Increment: ${progressModal.goal?.title || ''}`}
        description="Add progress towards your milestone"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <Input
            label={`Amount to add (${progressModal.goal?.unit || 'units'})`}
            type="number"
            step="any"
            value={progressModal.amount}
            onChange={(e) =>
              setProgressModal((s) => ({ ...s, amount: e.target.value }))
            }
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              onClick={() =>
                setProgressModal({ isOpen: false, goal: null, amount: 1 })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleProgressUpdate}>
              Add Progress
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
