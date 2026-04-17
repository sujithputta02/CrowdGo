import { db } from '@/lib/firebase-admin';

export interface Feedback {
  id: string;
  userId: string;
  recommendationId?: string;
  recommendationType: 'gate' | 'concession' | 'restroom' | 'route' | 'exit' | 'general';
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  comment?: string;
  actualWaitTime?: number;
  expectedWaitTime?: number;
  issueType?: 'inaccurate' | 'confusing' | 'unhelpful' | 'other';
  createdAt: Date;
  venueId: string;
  sessionId?: string;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  helpfulPercentage: number;
  acceptanceRate: number;
  accuracyScore: number;
  issueCount: number;
  topIssues: { type: string; count: number }[];
}

export const FeedbackService = {
  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const firestore = db();
    const feedbackRef = firestore.collection('feedback').doc();
    
    const newFeedback: Feedback = {
      ...feedback,
      id: feedbackRef.id,
      createdAt: new Date(),
    };

    await feedbackRef.set(newFeedback);
    
    console.log(`Feedback submitted: ${newFeedback.id} [Rating: ${newFeedback.rating}]`);
    
    return newFeedback;
  },

  /**
   * Get feedback metrics for analytics
   */
  async getFeedbackMetrics(
    venueId: string = 'wankhede',
    startDate?: Date,
    endDate?: Date
  ): Promise<FeedbackMetrics> {
    const firestore = db();
    let query: any = firestore
      .collection('feedback')
      .where('venueId', '==', venueId);

    if (startDate) {
      query = query.where('createdAt', '>=', startDate);
    }
    if (endDate) {
      query = query.where('createdAt', '<=', endDate);
    }

    const snapshot = await query.get();
    const feedbacks = snapshot.docs.map((doc: any) => doc.data() as Feedback);

    if (feedbacks.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        helpfulPercentage: 0,
        acceptanceRate: 0,
        accuracyScore: 0,
        issueCount: 0,
        topIssues: [],
      };
    }

    // Calculate metrics
    const totalRating = feedbacks.reduce((sum: number, f: Feedback) => sum + f.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    const helpfulCount = feedbacks.filter((f: Feedback) => f.helpful).length;
    const helpfulPercentage = (helpfulCount / feedbacks.length) * 100;

    // Acceptance rate (ratings >= 4)
    const acceptedCount = feedbacks.filter((f: Feedback) => f.rating >= 4).length;
    const acceptanceRate = (acceptedCount / feedbacks.length) * 100;

    // Accuracy score (based on wait time accuracy)
    const accurateFeedbacks = feedbacks.filter(
      (f: Feedback) => f.actualWaitTime !== undefined && f.expectedWaitTime !== undefined
    );
    let accuracyScore = 0;
    if (accurateFeedbacks.length > 0) {
      const accuracySum = accurateFeedbacks.reduce((sum: number, f: Feedback) => {
        const diff = Math.abs((f.actualWaitTime || 0) - (f.expectedWaitTime || 0));
        const accuracy = Math.max(0, 100 - (diff * 10)); // 10% penalty per minute difference
        return sum + accuracy;
      }, 0);
      accuracyScore = accuracySum / accurateFeedbacks.length;
    }

    // Issue analysis
    const issueCount = feedbacks.filter((f: Feedback) => f.issueType).length;
    const issueTypes: { [key: string]: number } = {};
    feedbacks.forEach((f: Feedback) => {
      if (f.issueType) {
        issueTypes[f.issueType] = (issueTypes[f.issueType] || 0) + 1;
      }
    });
    const topIssues = Object.entries(issueTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalFeedback: feedbacks.length,
      averageRating: Math.round(averageRating * 10) / 10,
      helpfulPercentage: Math.round(helpfulPercentage),
      acceptanceRate: Math.round(acceptanceRate),
      accuracyScore: Math.round(accuracyScore),
      issueCount,
      topIssues,
    };
  },

  /**
   * Get recent feedback for a specific recommendation type
   */
  async getFeedbackByType(
    recommendationType: Feedback['recommendationType'],
    venueId: string = 'wankhede',
    limit: number = 50
  ): Promise<Feedback[]> {
    const firestore = db();
    const snapshot = await firestore
      .collection('feedback')
      .where('venueId', '==', venueId)
      .where('recommendationType', '==', recommendationType)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => doc.data() as Feedback);
  },

  /**
   * Track recommendation acceptance (user clicked "Start Navigation")
   */
  async trackAcceptance(
    userId: string,
    recommendationId: string,
    recommendationType: Feedback['recommendationType'],
    venueId: string = 'wankhede'
  ): Promise<void> {
    await this.submitFeedback({
      userId,
      recommendationId,
      recommendationType,
      rating: 5, // Implicit 5-star for acceptance
      helpful: true,
      venueId,
    });
  },

  /**
   * Track recommendation rejection (user ignored or chose different option)
   */
  async trackRejection(
    userId: string,
    recommendationId: string,
    recommendationType: Feedback['recommendationType'],
    venueId: string = 'wankhede'
  ): Promise<void> {
    await this.submitFeedback({
      userId,
      recommendationId,
      recommendationType,
      rating: 2, // Implicit low rating for rejection
      helpful: false,
      venueId,
    });
  },
};
