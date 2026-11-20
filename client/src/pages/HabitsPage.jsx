import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Flame,
  Pause,
  Play,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  Heart,
  Music,
  BookOpen,
  Footprints,
  Moon,
  Palette,
  Bike,
  Droplets,
  Dumbbell,
  Code2,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import habitsApi from '../services/habits.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

const getHabitIcon = (iconName) => {
  const map = {
    Yoga: { icon: Heart, bg: 'bg-[#FFF0E8] text-[#FF6B4A]' },
    Singing: { icon: Music, bg: 'bg-[#F2EEFF] text-[#8B5CF6]' },
    Reading: { icon: BookOpen, bg: 'bg-[#EBF8F2] text-[#10B981]' },
    Running: { icon: Footprints, bg: 'bg-[#FFF7E6] text-[#F59E0B]' },
    Sleeping: { icon: Moon, bg: 'bg-[#EEF4FF] text-[#3B82F6]' },
    Drawing: { icon: Palette, bg: 'bg-[#FFF0F4] text-[#EC4899]' },
    Cycling: { icon: Bike, bg: 'bg-[#E6FAF7] text-[#06B6D4]' },
    Water: { icon: Droplets, bg: 'bg-[#E8F2FF] text-[#0284C7]' },
    Gym: { icon: Dumbbell, bg: 'bg-[#FFF0EB] text-[#EA580C]' },
    Code: { icon: Code2, bg: 'bg-[#F3EFFC] text-[#7C3AED]' },
    Coffee: { icon: Coffee, bg: 'bg-[#FFF8E7] text-[#D97706]' },
    CheckCircle2: { icon: CheckCircle2, bg: 'bg-peach-light text-coral' },
  };
  return map[iconName] || { icon: Heart, bg: 'bg-[#FFF0E8] text-[#FF6B4A]' };
};

export const HabitsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  // Fetch habits
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
    if (
      window.confirm(
        `Are you sure you want to delete "${habit.name}" and its associated logs? This cannot be undone.`
      )
    ) {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Habit Management
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Configure routines, frequency schedules, targets, and minimum versions.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-xs shadow-coral/30">
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          New Habit
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 text-warm-900 dark:text-warm-100 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral shadow-xs"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-full p-1 shadow-xs overflow-x-auto">
          {['all', 'active', 'paused', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-150',
                statusFilter === status
                  ? 'bg-coral text-white shadow-xs'
                  : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-surface-700'
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
          className="px-4 py-2 text-xs font-bold rounded-full bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 text-warm-700 dark:text-warm-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-coral/25"
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
        <div className="p-12 text-center text-xs text-warm-400 animate-pulse">
          Loading habits catalog...
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No habits match your filters"
          description="Adjust your filters or create a brand new routine."
          actionLabel="Create Habit"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const iconData = getHabitIcon(habit.icon);
            const IconComp = iconData.icon;

            return (
              <Card
                key={habit._id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow rounded-[24px] p-5"
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0',
                          iconData.bg
                        )}
                      >
                        <IconComp className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <Badge variant="default" className="text-[10px] uppercase">
                          {habit.category}
                        </Badge>
                      </div>
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
                  <div className="mt-3.5">
                    <Link
                      to={`/habits/${habit._id}`}
                      className="text-base font-bold text-warm-900 dark:text-warm-100 hover:text-coral transition-colors inline-flex items-center group"
                    >
                      {habit.name}
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    {habit.description && (
                      <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 line-clamp-2 leading-relaxed">
                        {habit.description}
                      </p>
                    )}
                  </div>

                  {/* Frequency & Target Details */}
                  <div className="mt-4 pt-3 border-t border-warm-100 dark:border-surface-700/60 space-y-1.5 text-xs text-warm-500 dark:text-warm-400">
                    <div className="flex justify-between items-center">
                      <span>Schedule</span>
                      <span className="font-semibold capitalize text-warm-700 dark:text-warm-300">
                        {habit.frequency?.type === 'everyday'
                          ? 'Daily'
                          : habit.frequency?.type === 'weekdays'
                          ? 'Weekdays'
                          : `${habit.frequency?.days?.length || 0} days/wk`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Target</span>
                      <span className="font-semibold text-warm-700 dark:text-warm-300">
                        {habit.target?.value} {habit.target?.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Current Streak</span>
                      <span className="font-bold text-coral flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-1 fill-coral" />
                        {habit.currentStreak || 0} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-warm-100 dark:border-surface-700/60">
                  <div className="flex items-center space-x-1">
                    {habit.status === 'active' ? (
                      <button
                        onClick={() => pauseMutation.mutate(habit._id)}
                        className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-500 hover:text-amber-600 transition-colors"
                        title="Pause habit"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : habit.status === 'paused' ? (
                      <button
                        onClick={() => resumeMutation.mutate(habit._id)}
                        className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-500 hover:text-emerald-600 transition-colors"
                        title="Resume habit"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : null}

                    {habit.status !== 'archived' && (
                      <button
                        onClick={() => archiveMutation.mutate(habit._id)}
                        className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-surface-700 text-warm-500 hover:text-warm-700 transition-colors"
                        title="Archive habit"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteConfirm(habit)}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-warm-400 hover:text-red-500 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => openEditModal(habit)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      {isModalOpen && (
        <HabitFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          habitToEdit={habitToEdit}
        />
      )}
    </div>
  );
};

export default HabitsPage;
