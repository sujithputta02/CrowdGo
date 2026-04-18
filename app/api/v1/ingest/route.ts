import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, setDoc as fbSetDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BigQueryService } from "@/lib/bigquery";
import { MonitoringService } from "@/lib/monitoring";
import { logger } from "@/lib/logger";
import { getErrorMessage, ValidationError, NotFoundError } from "@/lib/types/errors";

/**
 * Cloud Pub/Sub Push Webhook
 * Mimics the ingestion of real-time stadium events.
 */

interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
}

interface EventData {
  type: string;
  payload: Record<string, unknown>;
  timestamp?: number;
}

interface VenueService {
  id: string;
  wait: number;
  status?: string;
  [key: string]: unknown;
}

interface VenueData {
  services: VenueService[];
  [key: string]: unknown;
}

const PUBSUB_SECRET_HEADER = 'X-PubSub-Secret';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Security Check: Verify the Pub/Sub Secret Token
    const authHeader = req.headers.get(PUBSUB_SECRET_HEADER);
    const secretToken = process.env.PUBSUB_VERIFICATION_TOKEN;
    
    if (authHeader !== secretToken) {
      logger.error("Unauthorized Ingestion Attempt Blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PubSubMessage = await req.json();
    const message = body.message;
    
    if (!message || !message.data) {
      throw new ValidationError("No message data");
    }

    const data: EventData = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const { type, payload } = data;

    // Schema Validation (Security Hardening)
    if (!type || !payload || typeof payload !== 'object') {
       MonitoringService.log("Malformed Ingestion Payload", "WARNING", { data });
       throw new ValidationError("Invalid payload structure");
    }

    const venueRef = doc(db, "venues", "wankhede");
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
       MonitoringService.log("Venue [wankhede] Not Found", "ERROR");
       throw new NotFoundError("Venue");
    }
    
    const venueData = venueSnap.data() as VenueData;

    // 1. Long-Term Archival: Stream to BigQuery
    const enrichedPayload = {
      ...payload,
      wait: type === 'POS_SALE' 
        ? venueData.services.find((s) => s.id === payload.hubId)?.wait 
        : (venueData.services[0]?.wait || 0)
    };

    await BigQueryService.streamEvent({
      type,
      payload: enrichedPayload,
      timestamp: new Date().toISOString(),
      venue_id: 'wankhede'
    });

    // 2. Real-Time Updates: Firestore
    await handleEventType(type, payload, venueData, venueRef);

    MonitoringService.log("Stadium Event Ingested", "INFO", { type });
    return NextResponse.json({ success: true, event: type });
    
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    MonitoringService.log("Ingestion Error", "ERROR", { error: errorMessage });
    logger.error("Ingestion Error", error);
    
    const statusCode = error instanceof ValidationError ? 400 :
                       error instanceof NotFoundError ? 404 : 500;
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

async function handleEventType(
  type: string, 
  payload: Record<string, unknown>, 
  venueData: VenueData,
  venueRef: ReturnType<typeof doc>
): Promise<void> {
  switch (type) {
    case 'GATE_SCAN': {
      const services = venueData.services || [];
      const updatedServices = services.map((s) => {
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
      const updatedServices = services.map((s) => {
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
      await fbSetDoc(incidentRef, {
        ...payload,
        timestamp: new Date().toISOString(),
        status: 'reported'
      });
      break;
    }
  }
}
