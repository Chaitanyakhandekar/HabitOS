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
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'history' | 'review'
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [entryDate, setEntryDate] = useState(todayStr);

  // Daily Form State
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [reflection, setReflection] = useState('');
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // 1. Fetch Today's or Selected Date's Entry
  const { data: currentEntryRes, refetch: refetchEntry } = useQuery({
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

  // Sync current entry data to form when loaded
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            Daily Journal & Reflection
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Connect habit consistency with your psychological energy, wins, and reflections.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm">
          {[
            { id: 'daily', label: 'Reflection Form' },
            { id: 'history', label: 'Timeline History' },
            { id: 'review', label: 'Weekly Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700'
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
          {/* Main Reflection Form (2 Columns) */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-surface-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-text-primary">
                      Entry Date:
                    </span>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-surface-700 border border-slate-200 dark:border-surface-600 font-semibold"
                    />
                  </div>
                  {currentEntry && (
                    <Badge variant="success" className="text-[10px]">
                      Saved Record
                    </Badge>
                  )}
                </div>

                {/* Mood & Energy Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-2">
                      Mood Level
                    </label>
                    <div className="flex space-x-2">
                      {MOODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMood(m.value)}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-center border text-sm font-semibold transition-all',
                            mood === m.value
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300 scale-105 shadow-sm'
                              : 'border-slate-200 dark:border-surface-600 hover:bg-slate-50 dark:hover:bg-surface-700'
                          )}
                          title={m.label}
                        >
                          <span className="text-base">{m.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-2">
                      Energy Level (1-5)
                    </label>
                    <div className="flex space-x-1.5">
                      {ENERGIES.map((e) => (
                        <button
                          key={e.value}
                          type="button"
                          onClick={() => setEnergy(e.value)}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-xs font-semibold border transition-all',
                            energy === e.value
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-600 dark:text-amber-300 scale-105 shadow-sm'
                              : 'border-slate-200 dark:border-surface-600 hover:bg-slate-50 dark:hover:bg-surface-700'
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Today&apos;s Reflection
                  </label>
                  <textarea
                    rows={4}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="How did today unfold? What thoughts, blockers, or mental shifts did you experience?"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-surface-700/60 border border-slate-200 dark:border-surface-600 text-slate-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    required
                  />
                </div>

                {/* Wins & Challenges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Key Wins of the Day
                    </label>
                    <textarea
                      rows={2}
                      value={wins}
                      onChange={(e) => setWins(e.target.value)}
                      placeholder="What went well or felt rewarding?"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-700/60 border border-slate-200 dark:border-surface-600 text-slate-900 dark:text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                      Friction / Challenges
                    </label>
                    <textarea
                      rows={2}
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      placeholder="What distracted you or caused friction?"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-700/60 border border-slate-200 dark:border-surface-600 text-slate-900 dark:text-text-primary"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <Input
                    placeholder="e.g. focus, workout, deep-work, family"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-surface-700">
                  <Button type="submit" isLoading={saveMutation.isPending}>
                    Save Daily Reflection
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Tips and Guidance Column */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-indigo-950/40 to-surface-800 border-indigo-900/40">
              <h4 className="font-bold text-sm text-indigo-400 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5" />
                The Reflection Loop
              </h4>
              <p className="text-xs text-slate-300 dark:text-text-secondary mt-2 leading-relaxed">
                Recording your subjective energy alongside objective check-ins allows you to identify environmental patterns (e.g. why habits succeed on Wednesdays but falter on Sundays).
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reflections, wins, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-text-primary"
            />
          </div>

          {historyEntries.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="No journal reflections found"
              description="Complete your first daily reflection to build a historical journal."
            />
          ) : (
            <div className="space-y-4">
              {historyEntries.map((entry) => (
                <Card key={entry._id}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-surface-700/60">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-slate-900 dark:text-text-primary">
                        {entry.localDate}
                      </span>
                      <span className="text-base">
                        {MOODS.find((m) => m.value === entry.mood)?.emoji || '😊'}
                      </span>
                      <Badge variant="default" className="text-[10px]">
                        Energy: {entry.energy}/5
                      </Badge>
                    </div>

                    <button
                      onClick={() => deleteMutation.mutate(entry._id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-text-secondary mt-3 leading-relaxed whitespace-pre-wrap">
                    {entry.reflection}
                  </p>

                  {(entry.wins || entry.challenges) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-surface-700/50 text-xs">
                      {entry.wins && (
                        <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                          <strong>Win:</strong> {entry.wins}
                        </div>
                      )}
                      {entry.challenges && (
                        <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                          <strong>Challenge:</strong> {entry.challenges}
                        </div>
                      )}
                    </div>
                  )}

                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-surface-700 text-slate-600 dark:text-text-muted font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY REVIEW */}
      {activeTab === 'review' && weeklyReview && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  Weekly Adherence Review ({weeklyReview.startOfWeek} to {weeklyReview.endOfWeek})
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                  Automated weekly behavioral aggregation.
                </p>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40">
                <span className="text-[11px] font-mono uppercase text-slate-400">Total Completed</span>
                <div className="text-xl font-bold text-slate-900 dark:text-text-primary mt-1">
                  {weeklyReview.totalCompleted} / {weeklyReview.totalScheduled}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40">
                <span className="text-[11px] font-mono uppercase text-indigo-500">Weekly Adherence</span>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {weeklyReview.completionRate}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40">
                <span className="text-[11px] font-mono uppercase text-emerald-500">Strongest Day</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {weeklyReview.bestDay?.dayName || 'N/A'} ({weeklyReview.bestDay?.rate || 0}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40">
                <span className="text-[11px] font-mono uppercase text-rose-500">Weakest Day</span>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {weeklyReview.worstDay?.dayName || 'N/A'} ({weeklyReview.worstDay?.rate || 0}%)
                </div>
              </div>
            </div>

            {/* Aggregated Wins and Challenges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-surface-700">
              <div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  Weekly Wins
                </h4>
                {weeklyReview.summary?.wins?.length === 0 ? (
                  <p className="text-xs text-slate-400">No wins logged this week.</p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-text-secondary list-disc pl-4">
                    {weeklyReview.summary.wins.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                  Weekly Challenges
                </h4>
                {weeklyReview.summary?.challenges?.length === 0 ? (
                  <p className="text-xs text-slate-400">No challenges logged this week.</p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-text-secondary list-disc pl-4">
                    {weeklyReview.summary.challenges.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
