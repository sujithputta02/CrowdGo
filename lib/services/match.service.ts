import { MatchState } from '@/lib/types/venue';

export const MatchService = {
  getMatchStatus: (): MatchState => {
    // Simulated live match logic
    return {
      home: "Liverpool",
      away: "Man City",
      score: "0-0",
      time: "34'",
      nextBreak: "45'",
      nextSafeWindowIn: 11,
      momentum: 'high'
    };
  },
  
  isOptimalMovementTime: (minutesNeeded: number): boolean => {
    const status = MatchService.getMatchStatus();
    return status.nextSafeWindowIn >= minutesNeeded + 2; 
  }
};
