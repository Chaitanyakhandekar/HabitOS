import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookMarked,
  Sparkles,
  Calendar,
  Smile,
  Zap,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Tag,
  Trash2,
  Edit,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Input } from '../components/ui/Input.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import journalApi from '../services/journal.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

const MOODS = [
  { value: 1, label: 'Exhausted', emoji: '😫' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Superb', emoji: '🚀' },
];

const ENERGIES = [
  { value: 1, label: 'Drained' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Steady' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Peak' },
];

export const JournalPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [entryDate, setEntryDate] = useState(todayStr);

  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [reflection, setReflection] = useState('');
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // 1. Fetch Entry for selected date
  const { data: currentEntryRes } = useQuery({
    queryKey: ['journalEntry', entryDate],
    queryFn: () => journalApi.getByDate(entryDate),
  });

  // 2. Fetch Journal History
  const { data: historyRes } = useQuery({
    queryKey: ['journalHistory', searchQuery],
    queryFn: () => journalApi.getAll({ search: searchQuery || undefined }),
  });

  // 3. Fetch Weekly Review
  const { data: reviewRes } = useQuery({
    queryKey: ['weeklyReview', entryDate],
    queryFn: () => journalApi.getWeeklyReview({ date: entryDate }),
    enabled: activeTab === 'review',
  });

  const currentEntry = currentEntryRes?.data?.entry;
  const historyEntries = historyRes?.data?.entries || [];
  const weeklyReview = reviewRes?.data?.review;

  React.useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood || 4);
      setEnergy(currentEntry.energy || 4);
      setReflection(currentEntry.reflection || '');
      setWins(currentEntry.wins || '');
      setChallenges(currentEntry.challenges || '');
      setTagsInput(currentEntry.tags?.join(', ') || '');
    } else {
      setMood(4);
      setEnergy(4);
      setReflection('');
      setWins('');
      setChallenges('');
      setTagsInput('');
    }
  }, [currentEntry, entryDate]);

  const saveMutation = useMutation({
    mutationFn: (data) => journalApi.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntry', entryDate] });
      queryClient.invalidateQueries({ queryKey: ['journalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyReview'] });
      toast.success('Journal reflection saved!');
    },
    onError: (err) => toast.error(err.message || 'Failed to save reflection'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => journalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntry'] });
      queryClient.invalidateQueries({ queryKey: ['journalHistory'] });
      toast.success('Reflection deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reflection.trim()) {
      toast.error('Please write a brief reflection before saving');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveMutation.mutate({
      localDate: entryDate,
      mood,
      energy,
      reflection,
      wins,
      challenges,
      tags,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Daily Journal & Reflection
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Connect habit consistency with your psychological energy, daily wins, and reflections.
          </p>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-full p-1 shadow-xs overflow-x-auto">
          {[
            { id: 'daily', label: 'Reflection Form' },
            { id: 'history', label: 'Timeline History' },
            { id: 'review', label: 'Weekly Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150',
                activeTab === tab.id
                  ? 'bg-coral text-white shadow-xs'
                  : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DAILY REFLECTION FORM */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-[28px] p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-surface-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-coral" />
                    <span className="text-xs font-bold text-warm-700 dark:text-warm-200">
                      Entry Date:
                    </span>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="px-3 py-1 text-xs rounded-full bg-warm-100 dark:bg-surface-700 border border-warm-200/80 dark:border-surface-600 font-bold"
                    />
                  </div>
                  {currentEntry && (
                    <Badge variant="primary" className="text-[10px]">
                      Saved Record
                    </Badge>
                  )}
                </div>

                {/* Mood & Energy Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-warm-800 dark:text-warm-200 mb-2">
                      Mood Level
                    </label>
                    <div className="flex space-x-2">
                      {MOODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMood(m.value)}
                          className={cn(
                            'flex-1 py-2 rounded-2xl text-center border text-base font-semibold transition-all',
                            mood === m.value
                              ? 'bg-peach-light dark:bg-coral-950/60 border-coral scale-105 shadow-xs'
                              : 'border-warm-200 dark:border-surface-600 hover:bg-warm-50 dark:hover:bg-surface-700'
                          )}
                          title={m.label}
                        >
                          <span>{m.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-warm-800 dark:text-warm-200 mb-2">
                      Energy Level (1-5)
                    </label>
                    <div className="flex space-x-1.5">
                      {ENERGIES.map((e) => (
                        <button
                          key={e.value}
                          type="button"
                          onClick={() => setEnergy(e.value)}
                          className={cn(
                            'flex-1 py-2 rounded-2xl text-xs font-bold border transition-all',
                            energy === e.value
                              ? 'bg-peach-light dark:bg-coral-950/60 border-coral text-coral scale-105 shadow-xs'
                              : 'border-warm-200 dark:border-surface-600 hover:bg-warm-50 dark:hover:bg-surface-700 text-warm-600'
                          )}
                        >
                          {e.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reflection Text */}
                <div>
                  <label className="block text-xs font-bold text-warm-800 dark:text-warm-200 mb-1.5">
                    Today&apos;s Reflection
                  </label>
                  <textarea
                    rows={4}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="How did today unfold? What thoughts, blockers, or mental shifts did you experience?"
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral transition-all"
                    required
                  />
                </div>

                {/* Wins & Challenges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Key Wins of the Day
                    </label>
                    <textarea
                      rows={2}
                      value={wins}
                      onChange={(e) => setWins(e.target.value)}
                      placeholder="What went well or felt rewarding?"
                      className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1.5">
                      Friction / Challenges
                    </label>
                    <textarea
                      rows={2}
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      placeholder="What distracted you or caused friction?"
                      className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-warm-100 dark:bg-surface-700/60 border border-warm-200/70 dark:border-surface-600 text-warm-900 dark:text-warm-100"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-warm-800 dark:text-warm-200 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <Input
                    placeholder="e.g. focus, workout, deep-work, family"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-warm-100 dark:border-surface-700">
                  <Button type="submit" isLoading={saveMutation.isPending} className="px-6">
                    Save Daily Reflection
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Tips Column */}
          <div className="space-y-4">
            <div className="p-6 rounded-[26px] bg-gradient-to-br from-peach-light to-warm-50 dark:from-surface-800 dark:to-surface-800 border border-coral/20 shadow-xs">
              <h4 className="font-bold text-sm text-coral flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                The Reflection Loop
              </h4>
              <p className="text-xs text-warm-600 dark:text-warm-300 mt-2 leading-relaxed">
                Recording subjective energy alongside habit check-ins reveals environmental rhythms (e.g. why morning routines succeed on Tuesdays but encounter friction on Fridays).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder="Search reflections, wins, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-coral/25"
            />
          </div>

          {historyEntries.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="No journal reflections found"
              description="Complete your first daily reflection to build a historical journal."
            />
          ) : (
            <div className="space-y-3">
              {historyEntries.map((entry) => (
                <Card key={entry._id} className="rounded-[24px] p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-surface-700/60">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-warm-900 dark:text-warm-100">
                        {entry.localDate}
                      </span>
                      <span className="text-base">
                        {MOODS.find((m) => m.value === entry.mood)?.emoji || '😊'}
                      </span>
                      <Badge variant="peach" className="text-[10px]">
                        Energy: {entry.energy}/5
                      </Badge>
                    </div>

                    <button
                      onClick={() => deleteMutation.mutate(entry._id)}
                      className="p-1 rounded-full text-warm-400 hover:text-red-500 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-warm-700 dark:text-warm-300 mt-3 leading-relaxed whitespace-pre-wrap">
                    {entry.reflection}
                  </p>

                  {(entry.wins || entry.challenges) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-warm-100 dark:border-surface-700/50 text-xs">
                      {entry.wins && (
                        <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                          <strong>Win:</strong> {entry.wins}
                        </div>
                      )}
                      {entry.challenges && (
                        <div className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                          <strong>Challenge:</strong> {entry.challenges}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY REVIEW */}
      {activeTab === 'review' && (
        <Card className="rounded-[28px] p-6 space-y-6">
          <CardHeader>
            <CardTitle>Automated Behavioral Weekly Review</CardTitle>
            <span className="text-xs text-coral font-bold">
              {weeklyReview?.startDate} to {weeklyReview?.endDate}
            </span>
          </CardHeader>

          {weeklyReview ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-peach-light/50 dark:bg-surface-700 border border-coral/15 text-center">
                  <span className="text-xs font-semibold text-warm-500 block">Completion Rate</span>
                  <span className="text-2xl font-extrabold text-coral mt-1 block">
                    {weeklyReview.metrics?.completionRate || 0}%
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-peach-light/50 dark:bg-surface-700 border border-coral/15 text-center">
                  <span className="text-xs font-semibold text-warm-500 block">Total Completed</span>
                  <span className="text-2xl font-extrabold text-warm-900 dark:text-warm-100 mt-1 block">
                    {weeklyReview.metrics?.completedHabits || 0}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-peach-light/50 dark:bg-surface-700 border border-coral/15 text-center">
                  <span className="text-xs font-semibold text-warm-500 block">Avg Mood</span>
                  <span className="text-2xl font-extrabold text-warm-900 dark:text-warm-100 mt-1 block">
                    {weeklyReview.reflections?.averageMood || 'N/A'}/5
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-peach-light/50 dark:bg-surface-700 border border-coral/15 text-center">
                  <span className="text-xs font-semibold text-warm-500 block">Avg Energy</span>
                  <span className="text-2xl font-extrabold text-warm-900 dark:text-warm-100 mt-1 block">
                    {weeklyReview.reflections?.averageEnergy || 'N/A'}/5
                  </span>
                </div>
              </div>

              {/* Best Habits */}
              {weeklyReview.highlights?.topPerforming?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-warm-800 dark:text-warm-200 uppercase tracking-wider mb-2">
                    Top Consistent Routines
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {weeklyReview.highlights.topPerforming.map((h, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-surface-700 border border-emerald-200/60">
                        <span className="font-bold text-xs text-warm-900 dark:text-warm-100 block">{h.name}</span>
                        <span className="text-xs text-emerald-700 font-semibold">{h.rate}% completion</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-warm-400">
              Gathering weekly behavioral logs...
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default JournalPage;
