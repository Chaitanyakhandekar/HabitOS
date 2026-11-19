import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Flame,
  Pause,
  Play,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import habitsApi from '../services/habits.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export const HabitsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  // Fetch all user habits
  const { data, isLoading } = useQuery({
    queryKey: ['habits', statusFilter, categoryFilter, searchQuery],
    queryFn: () =>
      habitsApi.getAll({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery || undefined,
      }),
  });

  const habits = data?.data?.habits || [];

  // Mutations for Pause, Resume, Archive, Delete
  const pauseMutation = useMutation({
    mutationFn: (id) => habitsApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit paused');
    },
    onError: (err) => toast.error(err.message || 'Failed to pause habit'),
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => habitsApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit resumed');
    },
    onError: (err) => toast.error(err.message || 'Failed to resume habit'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => habitsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit archived');
    },
    onError: (err) => toast.error(err.message || 'Failed to archive habit'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => habitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete habit'),
  });

  const handleDeleteConfirm = (habit) => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}" and its associated logs? This cannot be undone.`)) {
      deleteMutation.mutate(habit._id);
    }
  };

  const openCreateModal = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            Habit Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Configure routines, frequency schedules, and fallback parameters.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Habit
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search habits by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm overflow-x-auto">
          {['all', 'active', 'paused', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700'
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-700 dark:text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">All Categories</option>
          <option value="health">Health</option>
          <option value="fitness">Fitness</option>
          <option value="learning">Learning</option>
          <option value="career">Career</option>
          <option value="mindfulness">Mindfulness</option>
          <option value="productivity">Productivity</option>
          <option value="finance">Finance</option>
          <option value="social">Social</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading habits catalog...
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No habits match your filters"
          description="Try adjusting your status or category filter, or create a brand new habit."
          actionLabel="Create Habit"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <Card key={habit._id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || '#6366f1' }}
                    />
                    <Badge variant="default" className="text-[10px] uppercase font-mono">
                      {habit.category}
                    </Badge>
                  </div>

                  {habit.status === 'paused' ? (
                    <Badge variant="warning">Paused</Badge>
                  ) : habit.status === 'archived' ? (
                    <Badge variant="default">Archived</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>

                {/* Habit Title & Description */}
                <div className="mt-3">
                  <Link
                    to={`/habits/${habit._id}`}
                    className="text-base font-semibold text-slate-900 dark:text-text-primary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center group"
                  >
                    {habit.name}
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  {habit.description && (
                    <p className="text-xs text-slate-500 dark:text-text-muted mt-1 line-clamp-2">
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Frequency & Target Metrics */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 dark:bg-surface-700/40 border border-slate-100 dark:border-surface-600/50 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-text-secondary">
                    <span>Target:</span>
                    <span className="font-semibold text-slate-800 dark:text-text-primary">
                      {habit.trackingType !== 'binary'
                        ? `${habit.target.value} ${habit.target.unit}`
                        : 'Binary check'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-text-secondary">
                    <span>Frequency:</span>
                    <span className="capitalize font-medium text-slate-800 dark:text-text-primary">
                      {habit.frequency?.type?.replace('_', ' ')}
                    </span>
                  </div>
                  {habit.minimumVersion?.enabled && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400 text-[11px]">
                      <span>Fallback:</span>
                      <span>{habit.minimumVersion.targetValue} {habit.target?.unit}</span>
                    </div>
                  )}
                </div>

                {/* Streak Highlights */}
                <div className="flex items-center justify-between mt-3 px-1 text-xs text-slate-500 dark:text-text-muted">
                  <div className="flex items-center text-amber-500 font-semibold">
                    <Flame className="w-4 h-4 mr-1" />
                    {habit.currentStreak || 0}d streak
                  </div>
                  <div>Best: {habit.longestStreak || 0}d</div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-surface-700/60 flex items-center justify-between">
                <Button variant="ghost" size="xs" onClick={() => openEditModal(habit)}>
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>

                <div className="flex items-center space-x-1">
                  {habit.status === 'active' && (
                    <button
                      onClick={() => pauseMutation.mutate(habit._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-surface-700"
                      title="Pause Habit"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {habit.status === 'paused' && (
                    <button
                      onClick={() => resumeMutation.mutate(habit._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-surface-700"
                      title="Resume Habit"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {habit.status !== 'archived' && (
                    <button
                      onClick={() => archiveMutation.mutate(habit._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-700"
                      title="Archive Habit"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteConfirm(habit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habitToEdit={habitToEdit}
      />
    </div>
  );
};

export default HabitsPage;
