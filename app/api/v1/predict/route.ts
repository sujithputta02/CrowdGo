import { NextRequest, NextResponse } from 'next/server';
import { BigQueryService } from '@/lib/bigquery';
import { VertexAIService } from '@/lib/vertex';
import { MonitoringService } from '@/lib/monitoring';
import { GeminiService } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { getErrorMessage, ValidationError } from '@/lib/types/errors';

/**
 * AI Prediction Proxy
 * Calculates 'True Wait' times by combining live Firestore states 
 * with either Real Vertex AI or a high-fidelity surrogate.
 */

interface PredictRequest {
  facilityId: string;
  type: 'gate' | 'pos';
  currentWait: number;
}

interface PredictResponse {
  facilityId: string;
  originalWait: number;
  predictedWait: number;
  confidence: 'low' | 'medium' | 'high';
  auraReason: string;
  engine: 'vertex-ai' | 'surrogate' | 'fallback';
  momentumFactors?: {
    recentArchivedEvents: number;
    surgeFactor: string;
  };
  timestamp: string;
}

const BIGQUERY_TIMEOUT_MS = 3000;
const VERTEX_TIMEOUT_MS = 3000;
const GEMINI_TIMEOUT_MS = 2000;
const SURGE_THRESHOLD_HIGH = 300;
const SURGE_THRESHOLD_MEDIUM = 100;
const SURGE_THRESHOLD_CRITICAL = 200;

export async function POST(req: NextRequest): Promise<NextResponse<PredictResponse>> {
  try {
    const body: PredictRequest = await req.json();
    const { facilityId, type, currentWait } = body;

    // Validate input
    if (!facilityId || currentWait === undefined) {
      throw new ValidationError('Missing required fields: facilityId, currentWait');
    }

    let recentCount = 0;
    let realAIData = null;

    // 1. Try to fetch historical momentum from BigQuery (with timeout)
    try {
      const eventType = type === 'gate' ? 'GATE_SCAN' : 'POS_SALE';
      const bqPromise = BigQueryService.getHistoricalSurgeTrend(eventType);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('BigQuery timeout')), BIGQUERY_TIMEOUT_MS)
      );
      recentCount = await Promise.race([bqPromise, timeoutPromise]);
    } catch (bqError) {
      logger.warn('BigQuery unavailable, using default momentum');
      recentCount = 0;
    }

    // 2. Try Real Vertex AI Prediction (with timeout)
    try {
      const vertexPromise = VertexAIService.predict({
        current_wait: currentWait,
        recent_scans: recentCount,
        stadium: 'wankhede'
      });
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Vertex AI timeout')), VERTEX_TIMEOUT_MS)
      );
      realAIData = await Promise.race([vertexPromise, timeoutPromise]);

      if (realAIData) {
        MonitoringService.log(`Vibe Check: Vertex AI active for ${facilityId}`, 'INFO', {
          facilityId,
          engine: 'vertex-ai',
          recentCount
        });

        return NextResponse.json({
          facilityId,
          originalWait: currentWait,
          predictedWait: Math.round(realAIData.predicted_wait || realAIData.wait || currentWait),
          confidence: (realAIData.confidence as 'low' | 'medium' | 'high') || 'medium',
          auraReason: realAIData.reason || "AI analyzing live crowd trajectory.",
          engine: 'vertex-ai',
          timestamp: new Date().toISOString()
        });
      }
    } catch (vertexError) {
      logger.warn('Vertex AI unavailable, using surrogate logic');
    }

    // 3. Fallback: Surrogate Logic (Rule-based with BigQuery data if available)
    MonitoringService.log(`Vibe Check: Using surrogate logic for ${facilityId}`, 'NOTICE', {
      facilityId,
      engine: 'surrogate',
      recentCount
    });

    const surgeMultiplier = recentCount > 0 ? 1 + (recentCount / 500) : 1.1;
    const predictedWait = Math.round(currentWait * surgeMultiplier);
    const confidence: 'low' | 'medium' | 'high' = 
      recentCount > SURGE_THRESHOLD_HIGH ? 'high' : 
      recentCount > SURGE_THRESHOLD_MEDIUM ? 'medium' : 'low';
    const isSurge = recentCount > SURGE_THRESHOLD_CRITICAL;

    // 4. Try to Generate Gemini "Aura Reasoning" (with timeout)
    let auraReason = isSurge 
      ? `Live surge detected: ${recentCount} scans in the last 15 min. Expect higher demand.`
      : "Crowd patterns stable. Standard wait time expected.";

    try {
      const geminiPromise = GeminiService.generateAuraReason({
        facilityName: facilityId,
        currentWait,
        predictedWait,
        recentScans: recentCount,
        isSurge
      });
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), GEMINI_TIMEOUT_MS)
      );
      const gReason = await Promise.race([geminiPromise, timeoutPromise]);
      if (gReason) auraReason = gReason;
    } catch (gErr) {
      logger.warn('Gemini reasoning unavailable, using default');
    }

    return NextResponse.json({
      facilityId,
      originalWait: currentWait,
      predictedWait,
      confidence,
      auraReason,
      engine: 'surrogate',
      momentumFactors: {
        recentArchivedEvents: recentCount,
        surgeFactor: surgeMultiplier.toFixed(2)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    logger.error('Prediction API critical error', error);
    MonitoringService.log('Prediction Proxy Error', 'ERROR', { error: getErrorMessage(error) });
    
    // Return a safe fallback response instead of 500 error
    return NextResponse.json({
      facilityId: 'unknown',
      originalWait: 5,
      predictedWait: 5,
      confidence: 'low',
      auraReason: 'Using baseline estimate. AI services temporarily unavailable.',
      engine: 'fallback',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}
