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
  const [filter, setFilter] = useState('all');

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
            Achievements & Milestones
          </h1>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Restrained milestones that celebrate discipline, recovery, and long-term consistency.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-white dark:bg-surface-800 border border-warm-200/80 dark:border-surface-700 rounded-full p-1 shadow-xs">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'locked', label: 'In Progress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-150',
                filter === tab.id
                  ? 'bg-coral text-white shadow-xs'
                  : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Strip Card */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-peach-light via-[#FFF5F0] to-warm-50 dark:from-surface-800 dark:to-surface-800 border border-coral/25 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A5C] text-white flex items-center justify-center shadow-md shadow-coral/30">
              <Trophy className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-warm-100">
                {unlockedCount} of {totalCount} Milestones Unlocked
              </h3>
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                Authentic behavioral performance verified by MongoDB records.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar
              value={unlockedCount}
              max={totalCount || 1}
              barClassName="bg-coral"
              showLabel
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-warm-400 animate-pulse">
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
                  'relative flex flex-col justify-between transition-all duration-200 rounded-[24px] p-5',
                  item.isUnlocked
                    ? 'border-coral/25 bg-white dark:bg-surface-800 shadow-xs'
                    : 'opacity-70 bg-warm-50/60 dark:bg-surface-800/40 border-dashed'
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs',
                        item.isUnlocked
                          ? 'bg-peach-light text-coral'
                          : 'bg-warm-200 dark:bg-surface-700 text-warm-400'
                      )}
                    >
                      {item.isUnlocked ? (
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <Badge
                      variant={item.isUnlocked ? 'primary' : 'default'}
                      className="text-[10px]"
                    >
                      {item.isUnlocked ? 'Unlocked' : `${item.progress}%`}
                    </Badge>
                  </div>

                  <div className="mt-3.5">
                    <h4 className="text-sm font-bold text-warm-900 dark:text-warm-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-warm-500 dark:text-warm-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-warm-100 dark:border-surface-700/60">
                  {item.isUnlocked ? (
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-warm-400 font-semibold">
                        <span>Progress: {item.current || 0} / {item.target}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <ProgressBar value={item.progress} size="sm" barClassName="bg-coral" />
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
