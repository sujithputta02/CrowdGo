import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BigQueryService } from "@/lib/bigquery";
import { MonitoringService } from "@/lib/monitoring";

/**
 * Cloud Pub/Sub Push Webhook
 * Mimics the ingestion of real-time stadium events.
 */
export async function POST(req: NextRequest) {
  try {
    // Security Check: Verify the Pub/Sub Secret Token
    const authHeader = req.headers.get("X-PubSub-Secret");
    const secretToken = process.env.PUBSUB_VERIFICATION_TOKEN;
    
    if (authHeader !== secretToken) {
      console.error("Unauthorized Ingestion Attempt Blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = body.message;
    if (!message || !message.data) {
      return NextResponse.json({ error: "No message data" }, { status: 400 });
    }

    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const { type, payload } = data;

    // 1. Schema Validation (Security Hardening)
    if (!type || !payload || typeof payload !== 'object') {
       MonitoringService.log("Malformed Ingestion Payload", "WARNING", { data });
       return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const venueRef = doc(db, "venues", "wankhede");
    const venueSnap = await getDoc(venueRef);
    if (!venueSnap.exists()) {
       MonitoringService.log("Venue [wankhede] Not Found", "ERROR");
       return NextResponse.json({ 
         error: "Venue not found", 
         details: "Please click 'Reset State' in /admin/simulation to initialize the wankhede document." 
       }, { status: 404 });
    }
    
    const venueData = venueSnap.data();

    // 1. Long-Term Archival: Stream to BigQuery (Enriched with current Firestore state)
    // We attach the current wait to the payload so BigQuery can save it as wait_time_minutes
    const enrichedPayload = {
      ...payload,
      wait: type === 'POS_SALE' 
        ? venueData.services.find((s:any) => s.id === payload.hubId)?.wait 
        : (venueData.services[0]?.wait || 0)
    };

    await BigQueryService.streamEvent({
      type,
      payload: enrichedPayload,
      timestamp: new Date().toISOString(),
      venue_id: 'wankhede'
    });

    // 2. Real-Time Updates: Firestore
    switch (type) {
      case 'GATE_SCAN': {
        const services = venueData.services || [];
        const updatedServices = services.map((s: any) => {
          if (s.id.includes('food') || s.id.includes('rest')) {
             return { ...s, wait: s.wait + 0.5 };
          }
          return s;
        });

        await updateDoc(venueRef, { services: updatedServices });
        break;
      }

      case 'POS_SALE': {
        const services = venueData.services || [];
        const updatedServices = services.map((s: any) => {
          if (s.id === payload.hubId) {
             const newStatus = s.wait > 10 ? 'busy' : 'locked-in';
             return { ...s, wait: s.wait + 1, status: newStatus };
          }
          return s;
        });

        await updateDoc(venueRef, { services: updatedServices });
        break;
      }

      case 'INCIDENT': {
        const incidentRef = doc(db, "incidents", Date.now().toString());
        await setDoc(incidentRef, {
          ...payload,
          timestamp: new Date().toISOString(),
          status: 'reported'
        });
        break;
      }
    }

    MonitoringService.log("Stadium Event Ingested", "INFO", { type });
    return NextResponse.json({ success: true, event: type });
  } catch (error: any) {
    MonitoringService.log("Ingestion Error", "ERROR", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function setDoc(ref: any, data: any) {
    const { setDoc: fbSetDoc } = await import("firebase/firestore");
    return fbSetDoc(ref, data);
}
