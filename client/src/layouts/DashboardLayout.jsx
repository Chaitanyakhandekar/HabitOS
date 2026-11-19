import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from '../components/layout/DesktopSidebar.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import MobileMoreSheet from '../components/layout/MobileMoreSheet.jsx';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-text-primary transition-colors duration-200">
      {/* Desktop / Tablet Sidebar (Hidden on mobile <768px) */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Mobile Top App Bar (Hidden on desktop/tablet ≥768px) */}
        <Navbar />

        {/* Scrollable Content Container with Bottom Clearance on Mobile */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Native-Quality Mobile Bottom Navigation (Hidden on desktop/tablet ≥768px) */}
      <MobileBottomNav
        onOpenMore={() => setIsMoreSheetOpen(true)}
        isMoreOpen={isMoreSheetOpen}
      />

      {/* Mobile "More" Drawer Sheet */}
      <MobileMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
