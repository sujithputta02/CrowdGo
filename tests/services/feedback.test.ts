import { FeedbackService } from '@/lib/services/feedback.service';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  db: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        id: 'test-feedback-id',
        set: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
      }),
    })),
  })),
}));

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit user feedback', async () => {
      const feedback = await FeedbackService.submitFeedback({
        userId: 'user-123',
        recommendationType: 'gate',
        rating: 5,
        helpful: true,
        venueId: 'wankhede',
      });

      expect(feedback).toBeDefined();
      expect(feedback.id).toBe('test-feedback-id');
      expect(feedback.rating).toBe(5);
      expect(feedback.helpful).toBe(true);
      expect(feedback.createdAt).toBeInstanceOf(Date);
    });

    it('should submit feedback with all optional fields', async () => {
      const feedback = await FeedbackService.submitFeedback({
        userId: 'user-456',
        recommendationId: 'rec-789',
        recommendationType: 'concession',
        rating: 3,
        helpful: false,
        comment: 'Wait time was longer than expected',
        actualWaitTime: 15,
        expectedWaitTime: 10,
        issueType: 'inaccurate',
        venueId: 'wankhede',
        sessionId: 'session-abc',
      });

      expect(feedback.comment).toBe('Wait time was longer than expected');
      expect(feedback.actualWaitTime).toBe(15);
      expect(feedback.expectedWaitTime).toBe(10);
      expect(feedback.issueType).toBe('inaccurate');
    });
  });

  describe('getFeedbackMetrics', () => {
    it('should calculate feedback metrics', async () => {
      const mockFeedbacks = [
        {
          rating: 5,
          helpful: true,
          actualWaitTime: 10,
          expectedWaitTime: 10,
        },
        {
          rating: 4,
          helpful: true,
          actualWaitTime: 12,
          expectedWaitTime: 10,
        },
        {
          rating: 3,
          helpful: false,
          issueType: 'inaccurate',
        },
        {
          rating: 2,
          helpful: false,
          issueType: 'confusing',
        },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockFeedbacks.map((f) => ({ data: () => f })),
          }),
        })),
      });

      const metrics = await FeedbackService.getFeedbackMetrics('wankhede');

      expect(metrics.totalFeedback).toBe(4);
      expect(metrics.averageRating).toBe(3.5);
      expect(metrics.helpfulPercentage).toBe(50);
      expect(metrics.acceptanceRate).toBe(50); // ratings >= 4
      expect(metrics.issueCount).toBe(2);
      expect(metrics.topIssues).toHaveLength(2);
    });

    it('should return zero metrics when no feedback', async () => {
      const metrics = await FeedbackService.getFeedbackMetrics('wankhede');

      expect(metrics.totalFeedback).toBe(0);
      expect(metrics.averageRating).toBe(0);
      expect(metrics.helpfulPercentage).toBe(0);
      expect(metrics.acceptanceRate).toBe(0);
    });

    it('should calculate accuracy score correctly', async () => {
      const mockFeedbacks = [
        {
          rating: 5,
          helpful: true,
          actualWaitTime: 10,
          expectedWaitTime: 10, // Perfect accuracy
        },
        {
          rating: 4,
          helpful: true,
          actualWaitTime: 12,
          expectedWaitTime: 10, // 2 min diff = 80% accuracy
        },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockFeedbacks.map((f) => ({ data: () => f })),
          }),
        })),
      });

      const metrics = await FeedbackService.getFeedbackMetrics('wankhede');

      expect(metrics.accuracyScore).toBe(90); // (100 + 80) / 2
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockWhere = jest.fn().mockReturnThis();
      const mockGet = jest.fn().mockResolvedValue({ docs: [] });

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: mockWhere,
          get: mockGet,
        })),
      });

      await FeedbackService.getFeedbackMetrics('wankhede', startDate, endDate);
      
      expect(mockWhere).toHaveBeenCalledWith('venueId', '==', 'wankhede');
    });
  });

  describe('getFeedbackByType', () => {
    it('should return feedback for specific type', async () => {
      const mockFeedbacks = [
        { id: 'fb-1', recommendationType: 'restroom', rating: 5 },
        { id: 'fb-2', recommendationType: 'restroom', rating: 4 },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockFeedbacks.map((f) => ({ data: () => f })),
          }),
        })),
      });

      const feedbacks = await FeedbackService.getFeedbackByType('restroom', 'wankhede', 50);

      expect(feedbacks).toHaveLength(2);
      expect(feedbacks[0].recommendationType).toBe('restroom');
    });
  });

  describe('trackAcceptance', () => {
    it('should track recommendation acceptance', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        id: 'test-feedback-id',
        set: mockSet,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await FeedbackService.trackAcceptance(
        'user-123',
        'rec-456',
        'gate',
        'wankhede'
      );
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          helpful: true,
          rating: 5,
        })
      );
    });
  });

  describe('trackRejection', () => {
    it('should track recommendation rejection', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        id: 'test-feedback-id',
        set: mockSet,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await FeedbackService.trackRejection(
        'user-789',
        'rec-012',
        'concession',
        'wankhede'
      );
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          helpful: false,
          rating: 2,
        })
      );
    });
  });
});
