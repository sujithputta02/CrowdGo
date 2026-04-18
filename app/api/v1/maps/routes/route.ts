import { NextRequest, NextResponse } from "next/server";
import { getSecret } from "@/lib/gcp-secrets";
import { MonitoringService } from "@/lib/monitoring";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/lib/types/errors";

const GOOGLE_ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  intermediates?: LatLng[];
  travelMode?: string;
  accessibleOnly?: boolean;
}

interface RouteResponse {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    polyline: {
      encodedPolyline: string;
    };
  }>;
}

interface GoogleRoutesRequestBody {
  origin: { location: { latLng: LatLng } };
  destination: { location: { latLng: LatLng } };
  intermediates?: Array<{ location: { latLng: LatLng } }>;
  travelMode: string;
  computeAlternativeRoutes: boolean;
  routeModifiers: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    avoidFerries: boolean;
    avoidStairs?: boolean;
    wheelchairAccessible?: boolean;
  };
  languageCode: string;
  units: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<RouteResponse>> {
  try {
    const body: RouteRequest = await req.json();
    const { origin, destination, intermediates, travelMode = "WALKING", accessibleOnly = false } = body;
    
    let apiKey: string;
    try {
      apiKey = await getSecret('GOOGLE_MAPS_API_KEY');
    } catch (e) {
      MonitoringService.log("Secret Manager Access Failed. Using Mock Route.", "WARNING");
      return NextResponse.json(generateMockRoute());
    }

    const requestBody: GoogleRoutesRequestBody = {
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: destination } },
      intermediates: intermediates?.map((i) => ({ location: { latLng: i } })),
      travelMode,
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: accessibleOnly,
      },
      languageCode: "en-US",
      units: "METRIC",
    };

    // Add accessibility constraints
    if (accessibleOnly) {
      requestBody.routeModifiers.avoidStairs = true;
      requestBody.routeModifiers.wheelchairAccessible = true;
    }

    const response = await fetch(GOOGLE_ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "Referer": "http://localhost:3000",
        "Origin": "http://localhost:3000",
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      MonitoringService.log("Google Routes API Error. Returning Mock.", "WARNING");
      return NextResponse.json(generateMockRoute());
    }

    const data: RouteResponse = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    MonitoringService.log("Maps Route Proxy Critical Error", "ERROR", { 
      error: getErrorMessage(error) 
    });
    logger.error("Maps Route Proxy Error", error);
    return NextResponse.json(generateMockRoute());
  }
}

function generateMockRoute(): RouteResponse {
  return {
    routes: [{
      duration: "420s",
      distanceMeters: 450,
      polyline: {
        encodedPolyline: "_kbEise_LkBa@yBe@pB_AlBe@"
      }
    }]
  };
}

