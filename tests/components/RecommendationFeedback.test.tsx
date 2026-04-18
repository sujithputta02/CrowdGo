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
});
