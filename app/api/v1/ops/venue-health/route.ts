import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get('venueId') || 'wankhede';
    
    const health = await IncidentService.getVenueHealth(venueId);
    
    return apiResponse.success(health);
  } catch (error) {
    console.error('Venue health error:', error);
    return apiResponse.error('Failed to fetch venue health', 500);
  }
}
