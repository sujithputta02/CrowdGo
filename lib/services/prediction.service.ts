/**
 * Prediction Service
 * Derives real-time queue states from live venue data.
 */
export interface QueueState {
  facilityId: string;
  waitRange: string;
  estimatedWaitMinutes: number;
  confidence: 'high' | 'medium' | 'low';
  auraReason?: string;
  lastUpdated: string;
}

export const PredictionService = {
  /**
   * Processes live wait times into AI-driven predictive states.
   */
  getQueueStatus: async (facilityId: string, currentWait: number, type: 'gate' | 'pos' = 'pos', signal?: AbortSignal): Promise<QueueState> => {
    try {
      // Use our internal Intelligence Proxy (Vertex AI surrogate)
      const response = await fetch('/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, type, currentWait }),
        signal
      });

      if (!response.ok) throw new Error('AI Proxy failure');
      
      const prediction = await response.json();
      console.log(`[PredictionService] Vibe Check successful for ${facilityId}`);

      return {
        facilityId,
        waitRange: `${prediction.predictedWait}-${prediction.predictedWait + 2} mins`,
        estimatedWaitMinutes: prediction.predictedWait,
        confidence: prediction.confidence,
        auraReason: prediction.auraReason,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn("AI Prediction Fallback triggered:", error);
      // Clean fallback if AI is unreachable
      return {
        facilityId,
        waitRange: `${currentWait}-${currentWait + 3} mins`,
        estimatedWaitMinutes: currentWait,
        confidence: 'low',
        auraReason: "Standard rule-based estimate (AI offline)",
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
