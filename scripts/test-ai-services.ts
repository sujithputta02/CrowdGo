/**
 * AI Services Health Check
 * Tests BigQuery, Vertex AI, and Gemini connectivity
 */

import { BigQueryService } from '../lib/bigquery';
import { VertexAIService } from '../lib/vertex';
import { GeminiService } from '../lib/gemini';

async function testBigQuery() {
  console.log('\n🔍 Testing BigQuery Service...');
  try {
    const result = await Promise.race([
      BigQueryService.getHistoricalSurgeTrend('GATE_SCAN'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    console.log('✅ BigQuery: WORKING');
    console.log(`   Recent scans: ${result}`);
    return true;
  } catch (error: any) {
    console.log('❌ BigQuery: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testVertexAI() {
  console.log('\n🤖 Testing Vertex AI Service...');
  try {
    const result = await Promise.race([
      VertexAIService.predict({
        current_wait: 10,
        recent_scans: 150,
        stadium: 'wankhede'
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    if (result) {
      console.log('✅ Vertex AI: WORKING');
      console.log(`   Predicted wait: ${result.predicted_wait || result.wait || 'N/A'}`);
      return true;
    } else {
      console.log('⚠️  Vertex AI: Not configured (using fallback)');
      return false;
    }
  } catch (error: any) {
    console.log('❌ Vertex AI: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testGemini() {
  console.log('\n✨ Testing Gemini Service...');
  try {
    const result = await Promise.race([
      GeminiService.generateAuraReason({
        facilityName: 'Test Gate',
        currentWait: 10,
        predictedWait: 12,
        recentScans: 150,
        isSurge: true
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    
    if (result) {
      console.log('✅ Gemini: WORKING');
      console.log(`   Response: "${result.substring(0, 80)}..."`);
      return true;
    } else {
      console.log('⚠️  Gemini: Timeout or not configured');
      return false;
    }
  } catch (error: any) {
    console.log('❌ Gemini: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testPredictAPI() {
  console.log('\n🔮 Testing Predict API Endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/v1/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId: 'test-gate-1',
        type: 'gate',
        currentWait: 10
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Predict API: WORKING');
      console.log(`   Engine: ${data.engine}`);
      console.log(`   Predicted wait: ${data.predictedWait} mins`);
      console.log(`   Confidence: ${data.confidence}`);
      console.log(`   Reason: "${data.auraReason?.substring(0, 60)}..."`);
      return true;
    } else {
      console.log('❌ Predict API: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown'}`);
      return false;
    }
  } catch (error: any) {
    console.log('❌ Predict API: FAILED');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the dev server is running: npm run dev');
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║           🔬 CrowdGo AI Services Health Check 🔬             ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const results = {
    bigquery: await testBigQuery(),
    vertexai: await testVertexAI(),
    gemini: await testGemini(),
    api: await testPredictAPI()
  };

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`BigQuery:    ${results.bigquery ? '✅ Working' : '❌ Failed'}`);
  console.log(`Vertex AI:   ${results.vertexai ? '✅ Working' : '⚠️  Fallback mode'}`);
  console.log(`Gemini:      ${results.gemini ? '✅ Working' : '⚠️  Fallback mode'}`);
  console.log(`Predict API: ${results.api ? '✅ Working' : '❌ Failed'}`);

  const workingCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\nOverall: ${workingCount}/${totalCount} services operational`);

  if (results.api) {
    console.log('\n✅ Your app will work! AI predictions are functional.');
  } else if (workingCount >= 1) {
    console.log('\n⚠️  Your app will work with degraded AI features.');
    console.log('   The app uses fallback logic when AI services are unavailable.');
  } else {
    console.log('\n❌ Critical: Predict API is not responding.');
    console.log('   Make sure the dev server is running: npm run dev');
  }

  console.log('\n📝 Note: It\'s normal for some services to be in fallback mode.');
  console.log('   The app is designed to work gracefully without full AI.');
}

main().catch(console.error);
