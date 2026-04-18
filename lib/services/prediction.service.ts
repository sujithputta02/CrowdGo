import { logger } from '../logger.client';
import { getErrorMessage } from '../types/errors';
import { QueueState, ConfidenceLevel } from '../types';

export type FacilityType = 'gate' | 'pos';

import { PredictionResponse } from '../types';

const PREDICTION_TIMEOUT_MS = 5000;
const FALLBACK_WAIT_BUFFER = 3;

export const PredictionService = {
  /**
   * Processes live wait times into AI-driven predictive states.
   */
  getQueueStatus: async (
    facilityId: string, 
    currentWait: number, 
    type: FacilityType = 'pos', 
    signal?: AbortSignal
  ): Promise<QueueState> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PREDICTION_TIMEOUT_MS);

      const response = await fetch('/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, type, currentWait }),
        signal: signal || controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Proxy returned ${response.status}`);
      }
      
      const prediction: PredictionResponse = await response.json();
      
      if (prediction.engine === 'fallback') {
        logger.warn('Prediction service returned fallback response');
      }

      return {
        facilityId,
        status: prediction.predictedWait > 10 ? 'busy' : 'optimal',
        wait: prediction.predictedWait,
        waitRange: `${prediction.predictedWait}-${prediction.predictedWait + 2} mins`,
        estimatedWaitMinutes: prediction.predictedWait,
        confidence: prediction.confidence,
        auraReason: prediction.auraReason,
        trend: 'stable',
        recommendation: prediction.auraReason,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        logger.warn('Prediction service fallback triggered', { error: getErrorMessage(error) });
      }
      
      return {
        facilityId,
        status: currentWait > 10 ? 'busy' : 'optimal',
        wait: currentWait,
        waitRange: `${currentWait}-${currentWait + FALLBACK_WAIT_BUFFER} mins`,
        estimatedWaitMinutes: currentWait,
        confidence: 'low',
        auraReason: "Standard estimate (AI temporarily offline)",
        trend: 'stable',
        recommendation: "Standard estimate (AI temporarily offline)",
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
