import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { MonitoringService } from './monitoring';

/**
 * Gemini REST Service (via Vertex AI)
 * Bypasses SDK conflicts to provide 100% reliable GenAI reasoning.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crowdgo-493512';
const LOCATION = 'us-central1';
const MODEL_ID = 'gemini-1.5-flash';

export const GeminiService = {
  /**
   * Generates a natural language explanation for a navigation recommendation.
   * Translates raw crowd data into an empathetic "Aura" suggestion for the fan.
   * 
   * @param context - The crowd state including facility info, wait times, and surge status
   * @returns A one-sentence AI-generated navigation tip, or null if reasoning fails
   */
  async generateAuraReason(context: {
    facilityName: string,
    currentWait: number,
    predictedWait: number,
    recentScans: number,
    isSurge: boolean
  }): Promise<string | null> {
    try {
      // 1. Authenticate with Service Account
      const keyPath = path.join(process.cwd(), 'gcp-key.json');
      const auth = new GoogleAuth({
        keyFile: keyPath,
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      });
      const client = await auth.getClient();
      const tokenResponse = await client.getAccessToken();
      const accessToken = tokenResponse.token;

      if (!accessToken) throw new Error('Failed to obtain access token');

      // 2. Prepare REST Request (Using v1beta1 for wider model coverage)
      const url = new URL(`https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:streamGenerateContent`);
      
      const prompt = `
        You are the "Aura Intelligence" for Wankhede Stadium (IPL).
        Context:
        - Target Facility: ${context.facilityName}
        - Current Wait: ${context.currentWait} mins
        - AI Predicted Wait: ${context.predictedWait} mins
        - Recent Crowd Scans (15m): ${context.recentScans}
        - Trend: ${context.isSurge ? 'Surge Detected' : 'Stable'}

        Task: Provide a one-sentence, premium, helpful navigation tip for a fan. 
        Focus on "Aura" and efficiency.
      `;

      const body = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
        }
      };

      // 3. Call Vertex AI Prediction Service
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Gemini Error] HTTP ${response.status} - ID: ${PROJECT_ID} - URL: ${url.toString()}`);
        throw new Error(`Vertex AI REST Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      
      // Parse streaming response (v1 endpoint often returns an array or single object)
      const text = data[0]?.candidates?.[0]?.content?.parts?.[0]?.text || 
                   data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Invalid Gemini Response Format');

      MonitoringService.log('Gemini Reasoning Generated (REST)', 'INFO', { facility: context.facilityName });
      return text.trim();
    } catch (error) {
      console.warn('Gemini REST Reasoning Failed:', (error as Error).message);
      return null;
    }
  }
};
