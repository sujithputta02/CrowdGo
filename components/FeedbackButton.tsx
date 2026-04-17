"use client";

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface FeedbackButtonProps {
  recommendationId?: string;
  recommendationType: 'gate' | 'concession' | 'restroom' | 'route' | 'exit' | 'general';
  expectedWaitTime?: number;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackButton({
  recommendationId,
  recommendationType,
  expectedWaitTime,
  onFeedbackSubmitted,
}: FeedbackButtonProps) {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [actualWaitTime, setActualWaitTime] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleQuickFeedback = async (helpful: boolean) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          recommendationId,
          recommendationType,
          rating: helpful ? 5 : 2,
          helpful,
          venueId: 'wankhede',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowFeedback(false);
          setSubmitted(false);
          onFeedbackSubmitted?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailedFeedback = async () => {
    if (!user || !rating) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          recommendationId,
          recommendationType,
          rating,
          helpful: rating >= 4,
          comment: comment || undefined,
          actualWaitTime,
          expectedWaitTime,
          venueId: 'wankhede',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowFeedback(false);
          setSubmitted(false);
          setRating(null);
          setComment('');
          setActualWaitTime(undefined);
          onFeedbackSubmitted?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
        <p className="text-sm font-bold text-green-500">Thank you for your feedback! 🎉</p>
      </div>
    );
  }

  if (!showFeedback) {
    return (
      <button
        onClick={() => setShowFeedback(true)}
        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-sm font-bold text-text-muted"
      >
        <MessageSquare size={16} />
        Was this helpful?
      </button>
    );
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold">Rate this recommendation</h4>
        <button
          onClick={() => setShowFeedback(false)}
          className="text-text-muted hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick Feedback */}
      <div className="flex gap-3">
        <button
          onClick={() => handleQuickFeedback(true)}
          disabled={submitting}
          className="flex-1 p-3 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ThumbsUp size={18} className="text-green-500" />
          <span className="text-sm font-bold text-green-500">Helpful</span>
        </button>
        <button
          onClick={() => handleQuickFeedback(false)}
          disabled={submitting}
          className="flex-1 p-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ThumbsDown size={18} className="text-red-500" />
          <span className="text-sm font-bold text-red-500">Not Helpful</span>
        </button>
      </div>

      {/* Detailed Feedback */}
      <div className="pt-4 border-t border-border space-y-3">
        <p className="text-xs text-text-muted">Or provide detailed feedback:</p>

        {/* Star Rating */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                rating && rating >= star
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                  : 'bg-white/5 border-white/10 text-text-muted hover:border-yellow-500/30'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Actual Wait Time */}
        {expectedWaitTime !== undefined && (
          <div>
            <label htmlFor="actual-wait-time" className="text-xs text-text-muted block mb-2">
              Actual wait time (optional)
            </label>
            <input
              id="actual-wait-time"
              type="number"
              value={actualWaitTime || ''}
              onChange={(e) => setActualWaitTime(parseInt(e.target.value) || undefined)}
              placeholder={`Expected: ${expectedWaitTime} min`}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-primary/50 focus:outline-none"
            />
          </div>
        )}

        {/* Comment */}
        <div>
          <label htmlFor="feedback-comment" className="text-xs text-text-muted block mb-2">
            Comment (optional)
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more..."
            rows={3}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-primary/50 focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleDetailedFeedback}
          disabled={!rating || submitting}
          className="w-full p-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
