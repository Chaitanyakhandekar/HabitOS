import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../components/ui/ProgressBar.jsx';

describe('ProgressBar Component', () => {
  it('renders percentage label when showLabel is true', () => {
    render(<ProgressBar value={75} max={100} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('clamps percentage between 0 and 100', () => {
    render(<ProgressBar value={150} max={100} showLabel />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
