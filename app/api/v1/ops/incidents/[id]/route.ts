import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { status, assignedTo } = body;
    
    if (!status) {
      return apiResponse.error('Status is required', 400);
    }
    
    await IncidentService.updateIncidentStatus(params.id, status, assignedTo);
    
    return apiResponse.success({ message: 'Incident updated successfully' });
  } catch (error) {
    logger.error('Failed to update incident', error);
    return apiResponse.error('Failed to update incident', 500);
  }
}
