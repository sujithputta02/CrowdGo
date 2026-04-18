import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { apiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const staffId = request.nextUrl.searchParams.get('staffId');
    
    if (!staffId) {
      return apiResponse.error('staffId is required', 400);
    }
    
    const tasks = await IncidentService.getTasksForStaff(staffId);
    
    return apiResponse.success({ tasks });
  } catch (error) {
    logger.error('Failed to fetch tasks', error);
    return apiResponse.error('Failed to fetch tasks', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, priority, assignedTo, assignedBy, zone, incidentId, dueBy } = body;
    
    if (!title || !description || !priority || !assignedTo || !assignedBy || !zone) {
      return apiResponse.error('Missing required fields', 400);
    }
    
    const task = await IncidentService.createTask({
      title,
      description,
      priority,
      assignedTo,
      assignedBy,
      zone,
      status: 'pending',
      incidentId,
      dueBy: dueBy ? new Date(dueBy) : undefined,
    });
    
    return apiResponse.success({ task }, 201);
  } catch (error) {
    logger.error('Failed to create task', error);
    return apiResponse.error('Failed to create task', 500);
  }
}
