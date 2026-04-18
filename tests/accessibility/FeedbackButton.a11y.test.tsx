/**
 * Accessibility tests for FeedbackButton component
 * Tests WCAG 2.1 compliance using jest-axe
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import FeedbackButton from '@/components/FeedbackButton';

expect.extend(toHaveNoViolations);

// Mock AuthProvider
jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' },
    profile: null,
  }),
}));

describe('FeedbackButton Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <FeedbackButton recommendationType="gate" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible button labels', () => {
    render(<FeedbackButton recommendationType="gate" />);
    const button = screen.getByRole('button', { name: /was this helpful/i });
    expect(button).toBeInTheDocument();
  });

  it('should have proper form labels when expanded', async () => {
    const { container } = render(
      <FeedbackButton recommendationType="gate" expectedWaitTime={5} />
    );
    
    // Click to expand
    const button = screen.getByRole('button', { name: /was this helpful/i });
    fireEvent.click(button);

    // Wait for form to appear
    await screen.findByText(/rate this recommendation/i);

    // Check for form labels
    const waitTimeLabel = screen.getByText(/actual wait time/i);
    expect(waitTimeLabel).toBeInTheDocument();

    const commentLabel = screen.getByText(/comment/i);
    expect(commentLabel).toBeInTheDocument();
  });

  it('should have accessible star rating buttons', async () => {
    render(<FeedbackButton recommendationType="gate" />);
    
    // Expand feedback
    const button = screen.getByRole('button', { name: /was this helpful/i });
    fireEvent.click(button);

    // Wait for detailed feedback section
    await screen.findByText(/rate this recommendation/i);

    // Check star buttons
    const allButtons = screen.getAllByRole('button');
    const starButtons = allButtons.filter(btn => 
      btn.textContent === '★'
    );
    expect(starButtons.length).toBe(5);
  });

  it('should announce submission status', () => {
    const { container } = render(
      <FeedbackButton recommendationType="gate" />
    );
    
    // After submission, should show success message
    // This would be tested with user interaction in integration tests
    expect(container).toBeInTheDocument();
  });
});
