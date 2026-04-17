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

    // 1. Fetch historical momentum from BigQuery
    const eventType = type === 'gate' ? 'GATE_SCAN' : 'POS_SALE';
    const recentCount = await BigQueryService.getHistoricalSurgeTrend(eventType);

    // 2. Attempt Real Vertex AI Prediction
    const realAIData = await VertexAIService.predict({
      current_wait: currentWait,
      recent_scans: recentCount,
      stadium: 'wankhede'
    });

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

    // 3. Fallback: Surrogate Logic (BigQuery-driven)
    MonitoringService.log(`Vibe Check: Falling back to surrogate for ${facilityId}`, 'NOTICE', {
      facilityId,
      engine: 'surrogate-bq',
      recentCount
    });

    const surgeMultiplier = 1 + (recentCount / 500);
    const predictedWait = Math.round(currentWait * surgeMultiplier);
    const confidence = recentCount > 300 ? 'high' : recentCount > 100 ? 'medium' : 'low';
    const isSurge = recentCount > 200;

    // 4. Generate Gemini "Aura Reasoning"
    let auraReason = isSurge 
      ? `Live Surge Detected: ${recentCount} scans in the last 15 min. AI predicting higher demand.`
      : "Patterns stable. Standard wait estimated.";

    try {
      const gReason = await GeminiService.generateAuraReason({
        facilityName: facilityId,
        currentWait,
        predictedWait,
        recentScans: recentCount,
        isSurge
      });
      if (gReason) auraReason = gReason;
    } catch (gErr) {
      MonitoringService.log("Gemini reasoning failed, using fallback.", "NOTICE");
    }

    return NextResponse.json({
      facilityId,
      originalWait: currentWait,
      predictedWait,
      confidence,
      auraReason,
      engine: 'surrogate-bq',
      momentumFactors: {
        recentArchivedEvents: recentCount,
        surgeFactor: surgeMultiplier.toFixed(2)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    MonitoringService.log('Prediction Proxy Error', 'ERROR', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
