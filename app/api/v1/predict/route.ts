import { NextRequest, NextResponse } from 'next/server';
import { BigQueryService } from '@/lib/bigquery';
import { VertexAIService } from '@/lib/vertex';
import { MonitoringService } from '@/lib/monitoring';
import { GeminiService } from '@/lib/gemini';

/**
 * AI Prediction Proxy
 * Calculates 'True Wait' times by combining live Firestore states 
 * with either Real Vertex AI or a high-fidelity surrogate.
 */
export async function POST(req: NextRequest) {
  try {
    const { facilityId, type, currentWait } = await req.json();

    // Validate input
    if (!facilityId || currentWait === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: facilityId, currentWait' 
      }, { status: 400 });
    }

    let recentCount = 0;
    let realAIData = null;

    // 1. Try to fetch historical momentum from BigQuery (with timeout)
    try {
      const eventType = type === 'gate' ? 'GATE_SCAN' : 'POS_SALE';
      const bqPromise = BigQueryService.getHistoricalSurgeTrend(eventType);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('BigQuery timeout')), 3000)
      );
      recentCount = await Promise.race([bqPromise, timeoutPromise]) as number;
    } catch (bqError) {
      console.warn('[Predict API] BigQuery unavailable, using default momentum');
      recentCount = 0; // Default to no surge data
    }

    // 2. Try Real Vertex AI Prediction (with timeout)
    try {
      const vertexPromise = VertexAIService.predict({
        current_wait: currentWait,
        recent_scans: recentCount,
        stadium: 'wankhede'
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Vertex AI timeout')), 3000)
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
          confidence: realAIData.confidence || 'medium',
          auraReason: realAIData.reason || "AI analyzing live crowd trajectory.",
          engine: 'vertex-ai',
          timestamp: new Date().toISOString()
        });
      }
    } catch (vertexError) {
      console.warn('[Predict API] Vertex AI unavailable, using surrogate logic');
    }

    // 3. Fallback: Surrogate Logic (Rule-based with BigQuery data if available)
    MonitoringService.log(`Vibe Check: Using surrogate logic for ${facilityId}`, 'NOTICE', {
      facilityId,
      engine: 'surrogate',
      recentCount
    });

    const surgeMultiplier = recentCount > 0 ? 1 + (recentCount / 500) : 1.1;
    const predictedWait = Math.round(currentWait * surgeMultiplier);
    const confidence = recentCount > 300 ? 'high' : recentCount > 100 ? 'medium' : 'low';
    const isSurge = recentCount > 200;

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
        setTimeout(() => resolve(null), 2000)
      );
      const gReason = await Promise.race([geminiPromise, timeoutPromise]);
      if (gReason) auraReason = gReason;
    } catch (gErr) {
      console.warn('[Predict API] Gemini reasoning unavailable, using default');
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

  } catch (error: any) {
    console.error('[Predict API] Critical error:', error);
    MonitoringService.log('Prediction Proxy Error', 'ERROR', { error: error.message });
    
    // Return a safe fallback response instead of 500 error
    return NextResponse.json({
      facilityId: 'unknown',
      originalWait: 5,
      predictedWait: 5,
      confidence: 'low',
      auraReason: 'Using baseline estimate. AI services temporarily unavailable.',
      engine: 'fallback',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 to prevent client-side errors
  }
}
