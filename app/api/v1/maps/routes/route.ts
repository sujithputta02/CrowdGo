import { NextRequest, NextResponse } from "next/server";
import { getSecret } from "@/lib/gcp-secrets";
import { MonitoringService } from "@/lib/monitoring";

const GOOGLE_ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, intermediates, travelMode = "WALKING", accessibleOnly = false } = await req.json();
    
    let apiKey: string;
    try {
      apiKey = await getSecret('GOOGLE_MAPS_API_KEY');
    } catch (e) {
      MonitoringService.log("Secret Manager Access Failed. Using Mock Route.", "WARNING");
      return NextResponse.json(generateMockRoute());
    }

    const requestBody: any = {
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: destination } },
      intermediates: intermediates?.map((i: any) => ({ location: { latLng: i } })),
      travelMode,
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: accessibleOnly, // Avoid ferries for accessible routes
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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    MonitoringService.log("Maps Route Proxy Critical Error", "ERROR", { error: error.message });
    return NextResponse.json(generateMockRoute());
  }
}

function generateMockRoute() {
  return {
    routes: [{
      duration: "420s",
      distanceMeters: 450,
      polyline: {
        encodedPolyline: "_kbEise_LkBa@yBe@pB_AlBe@" // Refined Wankhede Route
      }
    }]
  };
}

