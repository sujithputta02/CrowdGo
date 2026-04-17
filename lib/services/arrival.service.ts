import { MOCK_VENUE_STATE } from '../mock-data';

export interface ArrivalRecommendation {
  recommendedGate: string;
  arrivalWindow: string;
  status: 'early' | 'on-time' | 'late';
  loadLevel: 'low' | 'medium' | 'high';
}

export const ArrivalService = {
  getRecommendation: (section: string): ArrivalRecommendation => {
    // Logic: Suggest Gate A for sections 100-110, Gate B for 111-120, etc.
    const sectionNum = parseInt(section);
    let gate = '1';
    if (sectionNum > 110) gate = '2';
    if (sectionNum > 120) gate = '3';

    return {
      recommendedGate: gate,
      arrivalWindow: "18:45 - 19:10",
      status: 'on-time',
      loadLevel: 'medium'
    };
  }
};
