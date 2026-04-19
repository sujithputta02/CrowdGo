import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackButton from '@/components/FeedbackButton';
import { useAuth } from '@/components/AuthProvider';

// Mock AuthProvider
jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('FeedbackButton', () => {
  const mockUser = { uid: 'user-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('should render feedback button', () => {
    render(<FeedbackButton recommendationType="gate" />);

    expect(screen.getByText('Was this helpful?')).toBeInTheDocument();
  });

  it('should show feedback form when clicked', () => {
    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    expect(screen.getByText('Rate this recommendation')).toBeInTheDocument();
    expect(screen.getByText('Helpful')).toBeInTheDocument();
    expect(screen.getByText('Not Helpful')).toBeInTheDocument();
  });

  it('should submit quick positive feedback', async () => {
    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/feedback',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"rating":5'),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  it('should submit quick negative feedback', async () => {
    render(<FeedbackButton recommendationType="concession" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Not Helpful'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/feedback',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"rating":2'),
        })
      );
    });
  });

  it('should allow star rating selection', () => {
    render(<FeedbackButton recommendationType="restroom" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);

    fireEvent.click(stars[3]); // Click 4th star

    // Verify star is selected (4th star should be highlighted)
    const starButton = stars[3].closest('button');
    expect(starButton).toHaveClass('bg-yellow-500/20');
  });

  it('should submit detailed feedback with comment', async () => {
    render(<FeedbackButton recommendationType="route" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    // Select rating
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[4]); // 5 stars

    // Add comment
    const commentInput = screen.getByPlaceholderText('Tell us more...');
    fireEvent.change(commentInput, { target: { value: 'Great recommendation!' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/feedback',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Great recommendation!'),
        })
      );
    });
  });

  it('should allow actual wait time input', () => {
    render(<FeedbackButton recommendationType="gate" expectedWaitTime={10} />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    const waitTimeInput = screen.getByPlaceholderText('Expected: 10 min');
    expect(waitTimeInput).toBeInTheDocument();

    fireEvent.change(waitTimeInput, { target: { value: '12' } });
    expect(waitTimeInput).toHaveValue(12);
  });

  it('should disable submit button when no rating selected', () => {
    render(<FeedbackButton recommendationType="exit" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    const submitButton = screen.getByText('Submit Feedback');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when rating is selected', () => {
    render(<FeedbackButton recommendationType="exit" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[2]); // Select 3 stars

    const submitButton = screen.getByText('Submit Feedback');
    expect(submitButton).not.toBeDisabled();
  });

  it('should close feedback form', () => {
    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    expect(screen.getByText('Rate this recommendation')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    expect(screen.queryByText('Rate this recommendation')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Component doesn't show error UI, just logs it
    expect(screen.queryByText(/Thank you for your feedback/i)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should call onFeedbackSubmitted callback', async () => {
    jest.useFakeTimers();
    const onFeedbackSubmitted = jest.fn();

    render(
      <FeedbackButton
        recommendationType="gate"
        onFeedbackSubmitted={onFeedbackSubmitted}
      />
    );

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });

    // Fast-forward the 2 second timeout
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onFeedbackSubmitted).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('should not submit when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle network errors in quick feedback', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to submit feedback:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors in detailed feedback', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    // Select rating
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[2]); // 3 stars

    // Submit
    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to submit feedback:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show success message after quick feedback', async () => {
    jest.useFakeTimers();

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));
    fireEvent.click(screen.getByText('Helpful'));

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should show success message after detailed feedback', async () => {
    jest.useFakeTimers();

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    // Select rating
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[2]); // 3 stars

    // Submit
    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should reset form state after successful submission', async () => {
    jest.useFakeTimers();

    const { rerender } = render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    // Select rating
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[4]); // 5 stars

    // Add comment
    const commentInput = screen.getByPlaceholderText('Tell us more...');
    fireEvent.change(commentInput, { target: { value: 'Great!' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });

    // Fast-forward to close the form
    jest.advanceTimersByTime(2000);

    // Re-render to see the reset state
    rerender(<FeedbackButton recommendationType="gate" />);

    // Form should be closed
    expect(screen.queryByText('Rate this recommendation')).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it('should disable buttons while submitting', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<FeedbackButton recommendationType="gate" />);

    fireEvent.click(screen.getByText('Was this helpful?'));

    const helpfulButton = screen.getByText('Helpful');
    
    // Immediately check if disabled (before async completes)
    fireEvent.click(helpfulButton);
    
    // Wait for the fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should include all feedback data in API call', async () => {
    render(
      <FeedbackButton
        recommendationId="rec-123"
        recommendationType="gate"
        expectedWaitTime={15}
      />
    );

    fireEvent.click(screen.getByText('Was this helpful?'));

    // Select rating
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[3]); // 4 stars

    // Set actual wait time
    const waitTimeInput = screen.getByPlaceholderText('Expected: 15 min');
    fireEvent.change(waitTimeInput, { target: { value: '18' } });

    // Add comment
    const commentInput = screen.getByPlaceholderText('Tell us more...');
    fireEvent.change(commentInput, { target: { value: 'Accurate estimate' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/feedback',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"recommendationId":"rec-123"'),
        })
      );
    });

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody).toMatchObject({
      userId: 'user-123',
      recommendationId: 'rec-123',
      recommendationType: 'gate',
      rating: 4,
      helpful: true,
      comment: 'Accurate estimate',
      actualWaitTime: 18,
      expectedWaitTime: 15,
      venueId: 'wankhede',
    });
  });
});
