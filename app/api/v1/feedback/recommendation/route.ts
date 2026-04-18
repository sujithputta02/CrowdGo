import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, rating, comment, helpful } = body;

    if (!recommendationId || !rating) {
      return NextResponse.json(
        { error: 'recommendationId and rating are required' },
        { status: 400 }
      );
    }

    const feedback = await FeedbackService.submitFeedback({
      userId: 'anonymous',
      recommendationId,
      recommendationType: 'general',
      rating,
      helpful,
      comment,
      venueId: 'wankhede',
    });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error('Failed to record feedback', { error });
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const recommendationType = request.nextUrl.searchParams.get('type') || 'general';

    const metrics = await FeedbackService.getFeedbackMetrics('wankhede');

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Failed to fetch feedback metrics', { error });
    return NextResponse.json(
      { error: 'Failed to fetch feedback metrics' },
      { status: 500 }
    );
  }
}
