import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from '../components/layout/DesktopSidebar.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import QuickActionSheet from '../components/layout/QuickActionSheet.jsx';
import HabitFormModal from '../components/habits/HabitFormModal.jsx';
import HabitLogModal from '../components/habits/HabitLogModal.jsx';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-warm-50 dark:bg-surface-900 text-warm-900 dark:text-warm-100 transition-colors duration-200">
      {/* Desktop / Tablet Sidebar (Hidden on mobile <768px) */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Mobile Top App Bar (Hidden on desktop/tablet ≥768px) */}
        <Navbar onQuickAdd={() => setIsCreateHabitOpen(true)} />

        {/* Scrollable Content Container with Bottom Clearance on Mobile */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Reference-Styled Mobile Bottom Navigation (Hidden on desktop/tablet ≥768px) */}
      <MobileBottomNav
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Quick Action Sheet */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
        onOpenLogModal={() => setIsLogModalOpen(true)}
      />

      {/* Global Habit Creation Modal */}
      {isCreateHabitOpen && (
        <HabitFormModal
          isOpen={isCreateHabitOpen}
          onClose={() => setIsCreateHabitOpen(false)}
        />
      )}

      {/* Global Habit Log Modal */}
      {isLogModalOpen && (
        <HabitLogModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
