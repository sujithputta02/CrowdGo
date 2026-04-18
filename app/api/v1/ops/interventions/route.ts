import { NextRequest, NextResponse } from 'next/server';
import { PlaybookService } from '@/lib/services/playbook.service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const interventions = await PlaybookService.getRecentInterventions(20);
    const metrics = await PlaybookService.getInterventionMetrics();

    return NextResponse.json({
      success: true,
      data: {
        interventions,
        metrics,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch interventions', { error });
    return NextResponse.json(
      { error: 'Failed to fetch interventions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interventionId, action, approvedBy } = body;

    if (action === 'approve') {
      await PlaybookService.approveIntervention(interventionId, approvedBy);
    } else if (action === 'execute') {
      await PlaybookService.executeIntervention(interventionId, approvedBy);
    } else if (action === 'complete') {
      const { actualImpact, notes } = body;
      await PlaybookService.completeIntervention(interventionId, actualImpact, notes);
    }

    return NextResponse.json({
      success: true,
      message: `Intervention ${action} successful`,
    });
  } catch (error) {
    logger.error('Failed to update intervention', { error });
    return NextResponse.json(
      { error: 'Failed to update intervention' },
      { status: 500 }
    );
  }
}
