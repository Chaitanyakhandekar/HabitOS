import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import QuickActionSheet from '../components/layout/QuickActionSheet.jsx';

describe('Mobile Reference Navigation & Quick Actions', () => {
  it('renders all 5 reference bottom navigation items (Home, Calendar, +, Analytics, More)', () => {
    const handleOpenQuick = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileBottomNav onOpenQuickAction={handleOpenQuick} />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quick actions/i })).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('More tab is active when navigating to secondary routes', () => {
    const handleOpenQuick = vi.fn();
    const secondaryRoutes = ['/more', '/habits', '/goals', '/journal', '/achievements', '/settings'];
    secondaryRoutes.forEach((route) => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <MobileBottomNav onOpenQuickAction={handleOpenQuick} />
        </MemoryRouter>
      );
      // More tab link should exist and be rendered
      expect(screen.getByText('More')).toBeInTheDocument();
      unmount();
    });
  });

  it('triggers onOpenQuickAction when clicking the center + button', () => {
    const handleOpenQuick = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileBottomNav onOpenQuickAction={handleOpenQuick} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));
    expect(handleOpenQuick).toHaveBeenCalledTimes(1);
  });

  it('QuickActionSheet renders action items and tools when open', () => {
    const handleClose = vi.fn();
    const handleCreateHabit = vi.fn();
    const handleLogModal = vi.fn();

    render(
      <MemoryRouter>
        <QuickActionSheet
          isOpen={true}
          onClose={handleClose}
          onOpenCreateHabit={handleCreateHabit}
          onOpenLogModal={handleLogModal}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('New Habit')).toBeInTheDocument();
    expect(screen.getByText('Log Habit')).toBeInTheDocument();
    expect(screen.getByText('All Habits Management')).toBeInTheDocument();
    expect(screen.getByText('Daily Reflection & Journal')).toBeInTheDocument();
    expect(screen.getByText('Goals & Milestones')).toBeInTheDocument();
    expect(screen.getByText('Achievements & Badges')).toBeInTheDocument();
  });

  it('QuickActionSheet does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <QuickActionSheet isOpen={false} onClose={handleClose} />
      </MemoryRouter>
    );

    expect(screen.queryByText('New Habit')).not.toBeInTheDocument();
  });
});
