/**
 * Accessibility tests for High Contrast Mode
 * Tests WCAG 2.1 compliance using jest-axe
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HighContrastProvider, useHighContrast } from '@/lib/contexts/HighContrastContext';
import HighContrastToggle from '@/components/HighContrastToggle';

expect.extend(toHaveNoViolations);

// Mock AuthProvider
jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
  }),
}));

// Mock db functions
jest.mock('@/lib/db', () => ({
  updateUserSetting: jest.fn(),
}));

// Test component that uses the context
function TestComponent() {
  const { highContrast, toggleHighContrast } = useHighContrast();
  return (
    <div>
      <p>High Contrast: {highContrast ? 'On' : 'Off'}</p>
      <button onClick={toggleHighContrast}>Toggle</button>
    </div>
  );
}

describe('High Contrast Mode Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <HighContrastProvider>
        <HighContrastToggle />
      </HighContrastProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible toggle button', () => {
    render(
      <HighContrastProvider>
        <HighContrastToggle />
      </HighContrastProvider>
    );
    
    const button = screen.getByRole('button', { name: /enable high contrast mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should update aria-pressed when toggled', () => {
    render(
      <HighContrastProvider>
        <HighContrastToggle />
      </HighContrastProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    
    fireEvent.click(button);
    
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Disable'));
  });

  it('should apply high-contrast class to document', () => {
    render(
      <HighContrastProvider>
        <TestComponent />
      </HighContrastProvider>
    );
    
    const toggleButton = screen.getByText('Toggle');
    fireEvent.click(toggleButton);
    
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('should remove high-contrast class when disabled', () => {
    render(
      <HighContrastProvider>
        <TestComponent />
      </HighContrastProvider>
    );
    
    const toggleButton = screen.getByText('Toggle');
    
    // Enable
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    
    // Disable
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
  });

  it('should have visible focus indicator', () => {
    render(
      <HighContrastProvider>
        <HighContrastToggle />
      </HighContrastProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2');
  });
});
