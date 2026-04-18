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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
      
      const prediction = await response.json();
      
      // Handle fallback response from server
      if (prediction.engine === 'fallback') {
        console.warn('[PredictionService] Server returned fallback response');
      }

      return {
        facilityId,
        waitRange: `${prediction.predictedWait}-${prediction.predictedWait + 2} mins`,
        estimatedWaitMinutes: prediction.predictedWait,
        confidence: prediction.confidence,
        auraReason: prediction.auraReason,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      // Only log non-abort errors
      if (error.name !== 'AbortError') {
        console.warn('[PredictionService] Fallback triggered:', error.message);
      }
      
      // Clean fallback if AI is unreachable
      return {
        facilityId,
        waitRange: `${currentWait}-${currentWait + 3} mins`,
        estimatedWaitMinutes: currentWait,
        confidence: 'low',
        auraReason: "Standard estimate (AI temporarily offline)",
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
