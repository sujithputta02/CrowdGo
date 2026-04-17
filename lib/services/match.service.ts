export interface MatchState {
  home: string;
  away: string;
  score: string;
  time: string;
  momentum: number; // 0-100 scale
  nextSafeWindowIn: number; // minutes until next break
}

export const MatchService = {
  getMatchStatus: (): MatchState => {
    // Simulated live match logic
    return {
      home: "Liverpool",
      away: "Man City",
      score: "0-0",
      time: "34'",
      momentum: 75,
      nextSafeWindowIn: 11
    };
  },
  
  isOptimalMovementTime: (minutesNeeded: number): boolean => {
    const status = MatchService.getMatchStatus();
    return status.nextSafeWindowIn >= minutesNeeded + 2; 
  }
};
