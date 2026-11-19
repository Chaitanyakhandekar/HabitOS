import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { ProtectedRoute, PublicRoute } from '../components/guards/ProtectedRoute.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import TodayPage from '../pages/TodayPage.jsx';
import HabitsPage from '../pages/HabitsPage.jsx';
import HabitDetailsPage from '../pages/HabitDetailsPage.jsx';
import CalendarPage from '../pages/CalendarPage.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import GoalsPage from '../pages/GoalsPage.jsx';
import JournalPage from '../pages/JournalPage.jsx';
import AchievementsPage from '../pages/AchievementsPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },

  // Protected Application Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/today', element: <TodayPage /> },
          { path: '/habits', element: <HabitsPage /> },
          { path: '/habits/:id', element: <HabitDetailsPage /> },
          { path: '/calendar', element: <CalendarPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/goals', element: <GoalsPage /> },
          { path: '/journal', element: <JournalPage /> },
          { path: '/achievements', element: <AchievementsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default router;
