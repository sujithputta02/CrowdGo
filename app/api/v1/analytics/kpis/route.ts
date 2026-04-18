import { NextResponse } from "next/server";
import { BigQueryService } from "@/lib/bigquery";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/lib/types/errors";

/**
 * Analytics KPI Endpoint
 * Returns high-level insights derived from BigQuery long-term storage.
 */

interface BusiestGateResult {
  gate_id: string;
  scan_count: number;
}

interface KPIResponse {
  busiestGate: BusiestGateResult;
  lastAnalysisTimestamp: string;
  venueId: string;
}

export async function GET(): Promise<NextResponse<KPIResponse>> {
  try {
    const busiestGate = await BigQueryService.getBusiestGate();
    
    const kpis: KPIResponse = {
      busiestGate: busiestGate || { gate_id: 'None', scan_count: 0 },
      lastAnalysisTimestamp: new Date().toISOString(),
      venueId: 'wankhede'
    };

    return NextResponse.json(kpis);
  } catch (error: unknown) {
    logger.error("KPI Analysis Error", error);
    return NextResponse.json(
      { 
        error: getErrorMessage(error),
        busiestGate: { gate_id: 'None', scan_count: 0 },
        lastAnalysisTimestamp: new Date().toISOString(),
        venueId: 'wankhede'
      } as KPIResponse, 
      { status: 500 }
    );
  }
}
