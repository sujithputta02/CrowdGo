import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@/lib/services/feedback.service';
import { apiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      recommendationId,
      recommendationType,
      rating,
      helpful,
      comment,
      actualWaitTime,
      expectedWaitTime,
      issueType,
      venueId,
      sessionId,
    } = body;
    
    if (!userId || !recommendationType || rating === undefined || helpful === undefined) {
      return apiResponse.error('Missing required fields', 400);
    }
    
    if (rating < 1 || rating > 5) {
      return apiResponse.error('Rating must be between 1 and 5', 400);
    }
    
    const feedback = await FeedbackService.submitFeedback({
      userId,
      recommendationId,
      recommendationType,
      rating,
      helpful,
      comment,
      actualWaitTime,
      expectedWaitTime,
      issueType,
      venueId: venueId || 'wankhede',
      sessionId,
    });
    
    return apiResponse.success({ feedback }, 201);
  } catch (error) {
    console.error('Submit feedback error:', error);
    return apiResponse.error('Failed to submit feedback', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get('venueId') || 'wankhede';
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');
    
    const metrics = await FeedbackService.getFeedbackMetrics(
      venueId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    return apiResponse.success({ metrics });
  } catch (error) {
    console.error('Get feedback metrics error:', error);
    return apiResponse.error('Failed to fetch feedback metrics', 500);
  }
}
