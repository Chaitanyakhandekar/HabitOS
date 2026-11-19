import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Goal } from '../models/Goal.js';
import { JournalEntry } from '../models/JournalEntry.js';
import { Achievement } from '../models/Achievement.js';
import { addDays, getLocalDateString } from '../utils/dateUtils.js';
import { isHabitScheduledOnDate } from '../services/habitSchedule.service.js';
import { checkAndAwardAchievements } from '../services/achievement.service.js';

const seedDatabase = async () => {
  console.log('--- Starting HabitOS Seed Script ---');
  await connectDB();

  const demoEmail = 'demo@habitos.app';
  console.log(`Cleaning existing demo data for: ${demoEmail}...`);

  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    await Habit.deleteMany({ userId: existingUser._id });
    await HabitLog.deleteMany({ userId: existingUser._id });
    await Goal.deleteMany({ userId: existingUser._id });
    await JournalEntry.deleteMany({ userId: existingUser._id });
    await Achievement.deleteMany({ userId: existingUser._id });
    await User.findByIdAndDelete(existingUser._id);
  }

  // 1. Create Demo User
  const user = await User.create({
    name: 'Alex Mercer',
    email: demoEmail,
    password: 'Password123!',
    timezone: 'UTC',
    settings: {
      theme: 'dark',
      weekStartsOn: 'monday',
    },
    notifications: {
      enabled: true,
      reminderTime: '08:30',
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    },
  });

  console.log(`Demo user created: ${user.email} (Password: Password123!)`);

  const todayStr = getLocalDateString('UTC');
  const past45Days = addDays(todayStr, -44);

  // 2. Create Realistic Habits
  const habitsData = [
    {
      name: 'Morning Meditation',
      description: '10-minute mindfulness breathing to start the day with focus.',
      category: 'mindfulness',
      icon: 'Smile',
      color: '#8b5cf6',
      trackingType: 'duration',
      target: { value: 10, unit: 'mins' },
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6], targetPerWeek: 7 },
      startDate: past45Days,
      preferredTime: 'morning',
      minimumVersion: { enabled: true, description: '2 minutes of box breathing', targetValue: 2 },
      difficulty: 'easy',
      status: 'active',
    },
    {
      name: 'Hydration Target',
      description: 'Drink 3 liters of fresh water throughout the day.',
      category: 'health',
      icon: 'Droplets',
      color: '#06b6d4',
      trackingType: 'quantity',
      target: { value: 3, unit: 'liters' },
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6], targetPerWeek: 7 },
      startDate: past45Days,
      preferredTime: 'anytime',
      minimumVersion: { enabled: true, description: '1.5 liters', targetValue: 1.5 },
      difficulty: 'easy',
      status: 'active',
    },
    {
      name: 'Strength & Conditioning',
      description: 'Resistance training, kettlebells, or gym workout.',
      category: 'fitness',
      icon: 'Activity',
      color: '#ef4444',
      trackingType: 'duration',
      target: { value: 45, unit: 'mins' },
      frequency: { type: 'specific_days', days: [1, 3, 5, 6], targetPerWeek: 4 }, // Mon, Wed, Fri, Sat
      startDate: past45Days,
      preferredTime: 'morning',
      minimumVersion: { enabled: true, description: '15-minute bodyweight circuit', targetValue: 15 },
      difficulty: 'hard',
      status: 'active',
    },
    {
      name: 'Deep Work & Code',
      description: 'Uninterrupted deep work blocks for coding and architecture.',
      category: 'career',
      icon: 'Code2',
      color: '#6366f1',
      trackingType: 'duration',
      target: { value: 90, unit: 'mins' },
      frequency: { type: 'weekdays', days: [1, 2, 3, 4, 5], targetPerWeek: 5 },
      startDate: past45Days,
      preferredTime: 'morning',
      minimumVersion: { enabled: true, description: '30 mins focused work', targetValue: 30 },
      difficulty: 'medium',
      status: 'active',
    },
    {
      name: 'Read Non-Fiction Books',
      description: 'Read at least 20 pages from books on tech, psychology, or design.',
      category: 'learning',
      icon: 'BookOpen',
      color: '#10b981',
      trackingType: 'target',
      target: { value: 20, unit: 'pages' },
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6], targetPerWeek: 7 },
      startDate: past45Days,
      preferredTime: 'evening',
      minimumVersion: { enabled: true, description: 'Read 5 pages', targetValue: 5 },
      difficulty: 'medium',
      status: 'active',
    },
    {
      name: 'Evening Screen Detox',
      description: 'No phones or computer screens 30 minutes before bed.',
      category: 'personal',
      icon: 'Moon',
      color: '#f59e0b',
      trackingType: 'binary',
      target: { value: 1, unit: 'times' },
      frequency: { type: 'everyday', days: [0, 1, 2, 3, 4, 5, 6], targetPerWeek: 7 },
      startDate: past45Days,
      preferredTime: 'evening',
      minimumVersion: { enabled: false },
      difficulty: 'medium',
      status: 'active',
    },
  ];

  const createdHabits = [];
  for (const h of habitsData) {
    const habit = await Habit.create({
      ...h,
      userId: user._id,
      scheduleHistory: [
        {
          effectiveDate: h.startDate,
          frequency: h.frequency,
          target: h.target,
        },
      ],
    });
    createdHabits.push(habit);
  }

  console.log(`Created ${createdHabits.length} habits.`);

  // 3. Generate 45 Days of Realistic Logs
  const logsToInsert = [];
  let curDate = past45Days;
  let totalCompletions = 0;

  while (curDate <= todayStr) {
    for (const habit of createdHabits) {
      if (!isHabitScheduledOnDate(habit, curDate)) continue;

      // Deterministic pseudo-randomness based on date and habit name length
      const seed = (curDate.charCodeAt(9) * 7 + habit.name.length * 13) % 100;

      // Completion chances: high for meditation/water (85%), moderate for reading (80%), workout (75%)
      let probability = 80;
      if (habit.category === 'health' || habit.category === 'mindfulness') probability = 88;
      if (habit.category === 'fitness') probability = 75;

      if (seed < probability) {
        // Full completion
        logsToInsert.push({
          userId: user._id,
          habitId: habit._id,
          localDate: curDate,
          status: 'completed',
          value: habit.target.value,
          targetValue: habit.target.value,
          completionType: 'full',
          note: seed % 4 === 0 ? 'Felt energized and completed smoothly.' : '',
          completedAt: new Date(),
        });
        totalCompletions += 1;
      } else if (seed < probability + 8 && habit.minimumVersion?.enabled) {
        // Minimum version completed on busy days!
        logsToInsert.push({
          userId: user._id,
          habitId: habit._id,
          localDate: curDate,
          status: 'completed',
          value: habit.minimumVersion.targetValue,
          targetValue: habit.target.value,
          completionType: 'minimum',
          note: 'Tight schedule today; completed the fallback version.',
          completedAt: new Date(),
        });
        totalCompletions += 1;
      } else if (seed < probability + 14) {
        // Partial completion
        const partialVal = Math.round(habit.target.value * 0.5);
        logsToInsert.push({
          userId: user._id,
          habitId: habit._id,
          localDate: curDate,
          status: 'partial',
          value: partialVal,
          targetValue: habit.target.value,
          completionType: 'partial',
          note: 'Partially done before interruptions.',
          completedAt: new Date(),
        });
      }
      // Otherwise missed (no log or skipped)
    }
    curDate = addDays(curDate, 1);
  }

  await HabitLog.insertMany(logsToInsert);
  console.log(`Created ${logsToInsert.length} historical habit logs.`);

  // 4. Create Goals
  const readingHabit = createdHabits.find((h) => h.category === 'learning');
  const fitnessHabit = createdHabits.find((h) => h.category === 'fitness');

  await Goal.create([
    {
      userId: user._id,
      habitId: readingHabit?._id,
      title: 'Finish 3 Deep Work & Tech Books',
      description: 'Read 600 pages across 3 architectural books.',
      target: 600,
      unit: 'pages',
      progress: 380,
      startDate: past45Days,
      deadline: addDays(todayStr, 30),
      status: 'active',
    },
    {
      userId: user._id,
      habitId: fitnessHabit?._id,
      title: 'Complete 30 Heavy Gym Sessions',
      description: 'Build consistent strength routine this quarter.',
      target: 30,
      unit: 'sessions',
      progress: 22,
      startDate: past45Days,
      deadline: addDays(todayStr, 20),
      status: 'active',
    },
    {
      userId: user._id,
      habitId: null,
      title: 'Run a 10K Marathon',
      description: 'Independent cardio endurance milestone.',
      target: 10,
      unit: 'km',
      progress: 7.5,
      startDate: past45Days,
      deadline: addDays(todayStr, 45),
      status: 'active',
    },
  ]);
  console.log('Created sample goals.');

  // 5. Create Sample Journal Reflections
  const sampleReflections = [
    {
      daysAgo: 0,
      mood: 5,
      energy: 4,
      reflection: 'Crushed my morning routine today! Deep work block on distributed architectures was super productive.',
      wins: 'Finished the habit schedule service without bugs and drank 3L water.',
      challenges: 'Felt slight afternoon fatigue around 3 PM.',
      tags: ['productivity', 'focus', 'flow'],
    },
    {
      daysAgo: 1,
      mood: 4,
      energy: 4,
      reflection: 'Good balance today. Was tempted to skip meditation, but the 2-minute minimum fallback kept the streak alive.',
      wins: 'Read 25 pages of Designing Data-Intensive Applications.',
      challenges: 'Phone notifications were distracting before lunch.',
      tags: ['habits', 'books'],
    },
    {
      daysAgo: 3,
      mood: 4,
      energy: 5,
      reflection: 'Great physical energy from morning conditioning. Kept phone away during evening dinner.',
      wins: 'Zero screen time 45 mins before sleep.',
      challenges: 'Traffic delayed my evening routine slightly.',
      tags: ['fitness', 'recovery'],
    },
    {
      daysAgo: 6,
      mood: 3,
      energy: 3,
      reflection: 'Sunday rest day. Prepared my week goals and planned my study schedule.',
      wins: 'Weekly review completed and kitchen organized.',
      challenges: 'Slightly slow start in the morning.',
      tags: ['planning', 'reflection'],
    },
  ];

  for (const ref of sampleReflections) {
    const entryDate = addDays(todayStr, -ref.daysAgo);
    await JournalEntry.create({
      userId: user._id,
      localDate: entryDate,
      mood: ref.mood,
      energy: ref.energy,
      reflection: ref.reflection,
      wins: ref.wins,
      challenges: ref.challenges,
      tags: ref.tags,
    });
  }
  console.log('Created sample journal entries.');

  // 6. Award Initial Achievements
  await checkAndAwardAchievements(user._id, {
    totalCompletions,
    maxStreak: 18,
    consistency30d: 85,
    hasRecovery: true,
  });
  console.log('Awarded demo achievements.');

  console.log('--- Seed Completed Successfully! ---');
  await disconnectDB();
};

seedDatabase().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
