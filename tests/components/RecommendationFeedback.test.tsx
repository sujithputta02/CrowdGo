import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecommendationFeedback } from '@/components/dashboard/RecommendationFeedback';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('RecommendationFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render feedback buttons', () => {
    render(<RecommendationFeedback recommendationId="rec-1" />);

    expect(screen.getByText('Was this helpful?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should show comment option when rating is selected', async () => {
    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText(/Add Comment/i)).toBeInTheDocument();
    });
  });

  it('should submit feedback with rating', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/feedback/recommendation',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"rating":5'),
        })
      );
    });
  });

  it('should submit feedback with comment', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const addCommentButton = screen.getByText(/Add Comment/i);
      fireEvent.click(addCommentButton);
    });

    const textarea = screen.getByPlaceholderText('Tell us more... (optional)');
    fireEvent.change(textarea, { target: { value: 'Great recommendation!' } });

    const submitButton = screen.getByText('Submit Feedback');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/feedback/recommendation',
        expect.objectContaining({
          body: expect.stringContaining('Great recommendation!'),
        })
      );
    });
  });

  it('should show success message after submission', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit callback', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    const onSubmit = jest.fn();
    render(<RecommendationFeedback recommendationId="rec-1" onSubmit={onSubmit} />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Feedback');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // onSubmit is called with rating and comment
    expect(onSubmit).toHaveBeenCalledWith(expect.any(Number), expect.anything());
  });

  it('should handle negative feedback', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/feedback/recommendation',
        expect.objectContaining({
          body: expect.stringContaining('"rating":1'),
        })
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    // Should not show success message on error
    expect(screen.queryByText(/Thank you for your feedback/i)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to submit feedback:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should toggle comment visibility', async () => {
    render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText(/Add Comment/i)).toBeInTheDocument();
    });

    const addCommentButton = screen.getByText(/Add Comment/i);
    fireEvent.click(addCommentButton);

    // Comment textarea should be visible
    expect(screen.getByPlaceholderText('Tell us more... (optional)')).toBeInTheDocument();

    // Click again to hide
    const hideCommentButton = screen.getByText(/Hide Comment/i);
    fireEvent.click(hideCommentButton);

    // Textarea should be hidden
    expect(screen.queryByPlaceholderText('Tell us more... (optional)')).not.toBeInTheDocument();
  });

  it('should include helpful flag based on rating', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    // Test with high rating (helpful)
    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.helpful).toBe(true);
    });
  });

  it('should include helpful flag as false for low rating', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<RecommendationFeedback recommendationId="rec-1" />);

    // Test with low rating (not helpful)
    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.helpful).toBe(false);
    });
  });

  it('should reset form after successful submission', async () => {
    jest.useFakeTimers();

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    const { rerender } = render(<RecommendationFeedback recommendationId="rec-1" />);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);
    });

    // Fast-forward to trigger the reset
    jest.advanceTimersByTime(2000);

    // Re-render to see the reset state
    rerender(<RecommendationFeedback recommendationId="rec-1" />);

    // Form should be reset
    expect(screen.getByText('Was this helpful?')).toBeInTheDocument();

    jest.useRealTimers();
  });
});
