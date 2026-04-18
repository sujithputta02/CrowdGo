export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface PredictionRequest {
  facilityId: string;
  type: 'gate' | 'food' | 'restroom';
  currentWait: number;
}

export interface PredictionResponse {
  facilityId: string;
  originalWait: number;
  predictedWait: number;
  confidence: 'low' | 'medium' | 'high';
  auraReason: string;
  engine: 'vertex-ai' | 'gemini' | 'fallback';
}

export interface QueueState {
  facilityId: string;
  status: 'optimal' | 'busy' | 'locked-in';
  wait: number; // For backward compatibility if needed
  waitRange?: string;
  estimatedWaitMinutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  auraReason?: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
  lastUpdated?: string;
}
