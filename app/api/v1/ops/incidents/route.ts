import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get('venueId') || 'wankhede';
    
    const incidents = await IncidentService.getActiveIncidents(venueId);
    
    return apiResponse.success({ incidents });
  } catch (error) {
    console.error('Get incidents error:', error);
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
    console.error('Create incident error:', error);
    return apiResponse.error('Failed to create incident', 500);
  }
}
