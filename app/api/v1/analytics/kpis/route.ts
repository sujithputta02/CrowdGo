import { NextResponse } from "next/server";
import { BigQueryService } from "@/lib/bigquery";

/**
 * Analytics KPI Endpoint
 * Returns high-level insights derived from BigQuery long-term storage.
 */
export async function GET() {
  try {
    const busiestGate = await BigQueryService.getBusiestGate();
    
    // We can expand this to include historical averages, 
    // revenue peaks from POS data, and incident hotspots.
    const kpis = {
      busiestGate: busiestGate || { gate_id: 'None', scan_count: 0 },
      lastAnalysisTimestamp: new Date().toISOString(),
      venueId: 'wankhede'
    };

    return NextResponse.json(kpis);
  } catch (error: any) {
    console.error("KPI Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
