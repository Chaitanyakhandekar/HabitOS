import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Target,
  Medal,
  Crown,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import achievementsApi from '../services/achievements.api.js';
import { cn } from '../utils/cn.js';

const ICON_MAP = {
  Sparkles,
  Flame,
  Zap,
  Award,
  ShieldCheck,
  Crown,
  CheckCircle2,
  Target,
  Medal,
  Trophy,
  RefreshCw,
};

export const AchievementsPage = () => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  const { data: achievementsRes, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsApi.getAll(),
  });

  const achievements = achievementsRes?.data?.achievements || [];
  const unlockedCount = achievementsRes?.data?.unlockedCount || 0;
  const totalCount = achievementsRes?.data?.totalCount || achievements.length;

  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
            Achievements & Milestones
          </h1>
          <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
            Restrained milestones that celebrate discipline, recovery, and long-term consistency.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl p-1 shadow-sm">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'locked', label: 'In Progress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Strip Card */}
      <Card className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-text-primary">
                {unlockedCount} of {totalCount} Milestones Unlocked
              </h3>
              <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                Each badge reflects authentic behavioral performance verified by MongoDB.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar
              value={unlockedCount}
              max={totalCount || 1}
              barClassName="bg-amber-500"
              showLabel
            />
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading achievements matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const Icon = ICON_MAP[item.icon] || Trophy;

            return (
              <Card
                key={item.type}
                className={cn(
                  'relative flex flex-col justify-between transition-all duration-200',
                  item.isUnlocked
                    ? 'border-indigo-200 dark:border-indigo-900/60 shadow-sm'
                    : 'opacity-70 bg-slate-50/60 dark:bg-surface-800/40 border-dashed'
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
                        item.isUnlocked
                          ? 'bg-gradient-to-tr from-indigo-600 to-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-surface-700 text-slate-400'
                      )}
                    >
                      {item.isUnlocked ? (
                        <Icon className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <Badge variant={item.isUnlocked ? 'success' : 'default'} className="text-[10px]">
                      {item.isUnlocked ? 'Unlocked' : `${item.progress}%`}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-text-primary">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-text-muted mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-surface-700/60">
                  {item.isUnlocked ? (
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Progress: {item.current || 0} / {item.target}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <ProgressBar value={item.progress} size="sm" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
