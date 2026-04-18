import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const incidents = await IncidentService.getActiveIncidents();
    
    return apiResponse.success({ incidents });
  } catch (error) {
    logger.error('Failed to fetch incidents', error);
    return apiResponse.error('Failed to fetch incidents', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { type, severity, location, zone, description, reportedBy, reportedByRole, photoUrl } = body;
    
    if (!type || !severity || !location || !zone || !description) {
      return apiResponse.error('Missing required fields', 400);
    }
    
    const incident = await IncidentService.createIncident({
      type,
      severity,
      location,
      zone,
      description,
      reportedBy: reportedBy || 'anonymous',
      reportedByRole: reportedByRole || 'user',
      status: 'open',
      photoUrl,
    });
    
    return apiResponse.success({ incident }, 201);
  } catch (error) {
    logger.error('Failed to create incident', error);
    return apiResponse.error('Failed to create incident', 500);
  }
}
