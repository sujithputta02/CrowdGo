import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const health = await IncidentService.getVenueHealth();
    
    return apiResponse.success(health);
  } catch (error) {
    logger.error('Failed to fetch venue health', error);
    return apiResponse.error('Failed to fetch venue health', 500);
  }
}
