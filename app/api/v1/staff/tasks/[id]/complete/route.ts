import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incident.service';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await IncidentService.updateTaskStatus(id, 'completed');

    return NextResponse.json({
      success: true,
      message: 'Task completed',
    });
  } catch (error) {
    logger.error('Failed to complete task', { error });
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}
