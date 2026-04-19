import { MonitoringService } from './monitoring';
import { logger } from './logger';

/**
 * Aura Intelligence Service
 * Provides intelligent reasoning for crowd predictions using local logic.
 * No external API dependencies - works reliably offline.
 */

/**
 * Generate intelligent reasoning based on crowd patterns
 */
function generateLocalReasoning(context: {
  facilityName: string,
  currentWait: number,
  predictedWait: number,
  recentScans: number,
  isSurge: boolean
}): string {
  const { facilityName, currentWait, predictedWait, recentScans, isSurge } = context;
  
  // Determine wait trend
  const waitIncrease = predictedWait - currentWait;
  const waitTrend = waitIncrease > 5 ? 'increasing' : waitIncrease < -5 ? 'decreasing' : 'stable';
  
  // Generate contextual reasoning
  if (isSurge && recentScans > 300) {
    return `High surge detected at ${facilityName} with ${recentScans} recent scans. Expect ${predictedWait}-min wait. Consider alternative venues.`;
  }
  
  if (isSurge && recentScans > 150) {
    return `Moderate surge at ${facilityName}. Predicted wait: ${predictedWait} mins. Optimal time to visit in 10-15 mins.`;
  }
  
  if (waitTrend === 'decreasing' && currentWait > 10) {
    return `Queue at ${facilityName} is clearing up. Wait time dropping to ~${predictedWait} mins. Good time to go now.`;
  }
  
  if (waitTrend === 'increasing' && currentWait < 5) {
    return `${facilityName} is getting busy. Current wait: ${currentWait} mins, heading to ${predictedWait} mins. Go soon.`;
  }
  
  if (currentWait === 0) {
    return `${facilityName} is clear right now! No wait time. Perfect moment to visit.`;
  }
  
  if (currentWait < 5) {
    return `${facilityName} has minimal wait (~${currentWait} mins). Quick visit recommended.`;
  }
  
  if (currentWait < 15) {
    return `${facilityName} is moderately busy. Expect ~${predictedWait}-min wait. Manageable timing.`;
  }
  
  return `${facilityName} is busy with ~${predictedWait}-min wait. Consider visiting during next break.`;
}

export const GeminiService = {
  /**
   * Generates intelligent reasoning for navigation recommendations.
   * Uses local AI logic to provide contextual, helpful suggestions.
   * 
   * @param context - The crowd state including facility info, wait times, and surge status
   * @returns A helpful navigation tip based on current conditions
   */
  async generateAuraReason(context: {
    facilityName: string,
    currentWait: number,
    predictedWait: number,
    recentScans: number,
    isSurge: boolean
  }): Promise<string | null> {
    try {
      // Use intelligent local reasoning
      const localReason = generateLocalReasoning(context);
      MonitoringService.log('Aura Reasoning Generated (Local AI)', 'INFO', { 
        facility: context.facilityName 
      });
      return localReason;
    } catch (error) {
      logger.warn('Aura reasoning generation failed', { error: (error as Error).message });
      return null;
    }
  }
};
