export interface ExitRecommendation {
  recommendedGate: string;
  load: 'low' | 'medium' | 'high';
  estimatedTimeToExit: number; // in minutes
  transportMode: 'train' | 'car' | 'bus' | 'walk';
}

export const EgressService = {
  getExitStrategy: (destinationType: string): ExitRecommendation => {
    // Simulated exit logic
    // Suggest North Gate for Train, South Gate for Parking
    let gate = 'A';
    if (destinationType === 'train') gate = 'C';
    if (destinationType === 'car') gate = 'B';
    
    return {
      recommendedGate: gate,
      load: 'medium',
      estimatedTimeToExit: 12,
      transportMode: destinationType as any
    };
  }
};
