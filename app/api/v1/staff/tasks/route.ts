import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const staffId = request.nextUrl.searchParams.get('staffId');

    if (!staffId) {
      return NextResponse.json(
        { error: 'staffId is required' },
        { status: 400 }
      );
    }

    const tasks = await IncidentService.getTasksForStaff(staffId);

    return NextResponse.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    logger.error('Failed to fetch staff tasks', { error });
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
