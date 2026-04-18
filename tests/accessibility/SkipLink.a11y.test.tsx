/**
 * Accessibility tests for Skip Link
 * Tests WCAG 2.1 compliance using jest-axe
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SkipLink from '@/components/SkipLink';

expect.extend(toHaveNoViolations);

describe('SkipLink Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<SkipLink />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper link with href to main content', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should be visually hidden by default', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('sr-only');
  });

  it('should become visible on focus', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('focus:not-sr-only');
  });

  it('should have high z-index when focused', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('focus:z-[100]');
  });

  it('should have visible focus indicator', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('focus:ring-2');
  });

  it('should have high contrast background when focused', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('focus:bg-primary');
    expect(link).toHaveClass('focus:text-white');
  });
});
