import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BigQueryService } from '../lib/bigquery';
import { getSecret } from '../lib/gcp-secrets';
import { GeminiService } from '../lib/gemini';
import { MonitoringService } from '../lib/monitoring';

/**
 * 100% Google Services Health Check Suite
 * Validates the vertical integration of all Cloud components.
 */
async function runHealthCheck() {
  console.log('--- AURA STADIUM: CLOUD HEALTH CHECK ---');
  let failures = 0;

  // 1. Secret Manager Check
  try {
    const key = await getSecret('GOOGLE_MAPS_API_KEY');
    console.log('✅ SECRET MANAGER: GOOGLE_MAPS_API_KEY reachable.');
  } catch (e: any) {
    console.error('❌ SECRET MANAGER: Failed to fetch keys.');
    console.error(`   Error Detail: ${e.message}`);
    const envExists = !!(process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    console.log(`   Local ENV Fallback Available: ${envExists}`);
    failures++;
  }

  // 2. BigQuery Connectivity
  try {
    const surge = await BigQueryService.getHistoricalSurgeTrend('GATE_SCAN');
    console.log('✅ BIGQUERY: Dataset and Surge Logic reachable.');
  } catch (e) {
    console.error('❌ BIGQUERY: Query failed.');
    failures++;
  }

  // 3. Gemini / Vertex AI
  try {
    const reason = await GeminiService.generateAuraReason({
      facilityName: 'HealthCheckGate',
      currentWait: 5,
      predictedWait: 10,
      recentScans: 50,
      isSurge: false
    });
    if (reason) {
      console.log('✅ GEMINI AI: Aura Intelligence reasoning generated successfully.');
    } else {
      throw new Error('Gemini returned null');
    }
  } catch (e) {
    console.error('❌ GEMINI AI: Reasoning engine unreachable.');
    failures++;
  }

  // 4. Monitoring / Logging
  try {
    await MonitoringService.log('Cloud Health Check Executed', 'NOTICE');
    console.log('✅ CLOUD LOGGING: Structured logs streaming correctly.');
  } catch (e) {
    console.error('❌ CLOUD LOGGING: Failed to write logs.');
    failures++;
  }

  console.log('---------------------------------------');
  if (failures === 0) {
    console.log('🏆 100% GOOGLE SERVICES HEALTHY');
  } else {
    console.log(`⚠️ ${failures} SYSTEMS OFFLINE/DISCONNECTED`);
  }
}

runHealthCheck().then(() => process.exit(0)).catch(e => {
  console.error('Critical Failure:', e);
  process.exit(1);
});
