import { render, screen, waitFor } from '@testing-library/react';
import MatchWidget from '@/components/MatchWidget';

// Mock MatchService
jest.mock('@/lib/services/match.service', () => ({
  MatchService: {
    getMatchStatus: jest.fn(() => ({
      home: 'Liverpool',
      away: 'Man City',
      score: '2-1',
      time: "67'",
      momentum: 75,
      nextSafeWindowIn: 15,
    })),
    isOptimalMovementTime: jest.fn((minutes) => minutes <= 15),
  },
}));

describe('MatchWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render match status', () => {
    render(<MatchWidget />);

    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Man City')).toBeInTheDocument();
    expect(screen.getByText('2-1')).toBeInTheDocument();
    expect(screen.getByText("67'")).toBeInTheDocument();
  });

  it('should show live indicator', () => {
    render(<MatchWidget />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should display momentum bar', () => {
    render(<MatchWidget />);

    expect(screen.getByText('Match Momentum')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should show next break timing', () => {
    render(<MatchWidget />);

    expect(screen.getByText('Next break in')).toBeInTheDocument();
    expect(screen.getByText('15 minutes')).toBeInTheDocument();
  });

  it('should show safe to leave indicator when time is sufficient', () => {
    render(<MatchWidget estimatedTimeNeeded={10} showWarning={true} />);

    waitFor(() => {
      expect(screen.getByText('Safe to Leave')).toBeInTheDocument();
    });
  });

  it('should show timing warning when time is insufficient', () => {
    const { MatchService } = require('@/lib/services/match.service');
    MatchService.isOptimalMovementTime.mockReturnValue(false);
    MatchService.getMatchStatus.mockReturnValue({
      home: 'Liverpool',
      away: 'Man City',
      score: '2-1',
      time: "67'",
      momentum: 75,
      nextSafeWindowIn: 5, // Only 5 minutes until break
    });

    render(<MatchWidget estimatedTimeNeeded={10} showWarning={true} />);

    waitFor(() => {
      expect(screen.getByText('Timing Warning')).toBeInTheDocument();
      expect(screen.getByText(/may miss approximately/i)).toBeInTheDocument();
    });
  });

  it('should show optimal timing suggestion when not safe', () => {
    const { MatchService } = require('@/lib/services/match.service');
    MatchService.isOptimalMovementTime.mockReturnValue(false);
    MatchService.getMatchStatus.mockReturnValue({
      home: 'Liverpool',
      away: 'Man City',
      score: '2-1',
      time: "67'",
      momentum: 75,
      nextSafeWindowIn: 5,
    });

    render(<MatchWidget estimatedTimeNeeded={10} showWarning={true} />);

    waitFor(() => {
      expect(screen.getByText('Optimal Timing')).toBeInTheDocument();
      expect(screen.getByText(/Wait 5 minutes/i)).toBeInTheDocument();
    });
  });

  it('should not show warnings when showWarning is false', () => {
    render(<MatchWidget estimatedTimeNeeded={10} showWarning={false} />);

    expect(screen.queryByText('Safe to Leave')).not.toBeInTheDocument();
    expect(screen.queryByText('Timing Warning')).not.toBeInTheDocument();
  });

  it('should not show warnings when estimatedTimeNeeded is 0', () => {
    render(<MatchWidget estimatedTimeNeeded={0} showWarning={true} />);

    expect(screen.queryByText('Safe to Leave')).not.toBeInTheDocument();
    expect(screen.queryByText('Timing Warning')).not.toBeInTheDocument();
  });

  it('should update match state periodically', async () => {
    const { MatchService } = require('@/lib/services/match.service');
    
    render(<MatchWidget />);

    expect(MatchService.getMatchStatus).toHaveBeenCalledTimes(1);

    // Fast-forward time by 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(MatchService.getMatchStatus).toHaveBeenCalledTimes(2);
    });
  });

  it('should cleanup interval on unmount', () => {
    const { unmount } = render(<MatchWidget />);
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
