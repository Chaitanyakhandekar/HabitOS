import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import MobileMoreSheet from '../components/layout/MobileMoreSheet.jsx';

describe('Mobile Responsive Navigation Components', () => {
  it('renders all 5 primary bottom navigation items with labels', () => {
    const handleOpenMore = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileBottomNav onOpenMore={handleOpenMore} isMoreOpen={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('triggers onOpenMore callback when clicking the More item', () => {
    const handleOpenMore = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileBottomNav onOpenMore={handleOpenMore} isMoreOpen={false} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('More'));
    expect(handleOpenMore).toHaveBeenCalledTimes(1);
  });

  it('MobileMoreSheet renders secondary destinations when open', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <MobileMoreSheet isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    expect(screen.getByText('Calendar & Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Daily Journal')).toBeInTheDocument();
    expect(screen.getByText('Goals & Milestones')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Settings & Data Export')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('MobileMoreSheet does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <MobileMoreSheet isOpen={false} onClose={handleClose} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Calendar & Heatmap')).not.toBeInTheDocument();
  });
});
