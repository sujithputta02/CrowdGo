"use client";

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendationFeedbackProps {
  recommendationId: string;
  onSubmit?: (rating: number, comment?: string) => void;
}

export function RecommendationFeedback({ recommendationId, onSubmit }: RecommendationFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) return;
    
    try {
      const res = await fetch('/api/v1/feedback/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId,
          rating,
          comment: comment || undefined,
          helpful: rating >= 4,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        onSubmit?.(rating, comment);
        setTimeout(() => {
          setRating(null);
          setComment('');
          setShowComment(false);
          setSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <AnimatePresence>
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-6 p-4 bg-surface/50 border border-border rounded-lg"
        >
          <p className="text-xs font-bold uppercase text-text-muted mb-3">Was this helpful?</p>
          
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setRating(5)}
              className={`flex-1 p-3 rounded-lg font-bold uppercase text-sm transition-all ${
                rating === 5
                  ? 'bg-green-500 text-white'
                  : 'bg-background border border-border text-text hover:border-green-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mx-auto mb-1" />
              Yes
            </button>
            <button
              onClick={() => setRating(1)}
              className={`flex-1 p-3 rounded-lg font-bold uppercase text-sm transition-all ${
                rating === 1
                  ? 'bg-red-500 text-white'
                  : 'bg-background border border-border text-text hover:border-red-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4 mx-auto mb-1" />
              No
            </button>
          </div>

          {rating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <button
                onClick={() => setShowComment(!showComment)}
                className="w-full text-xs font-bold uppercase text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3 h-3" />
                {showComment ? 'Hide' : 'Add'} Comment
              </button>

              {showComment && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more... (optional)"
                  className="w-full px-3 py-2 text-xs border border-border rounded bg-background text-text placeholder-text-muted resize-none"
                  rows={2}
                />
              )}

              <button
                onClick={handleSubmit}
                className="w-full px-3 py-2 bg-primary text-white rounded font-bold text-xs uppercase hover:bg-primary/90 transition-colors"
              >
                Submit Feedback
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
        >
          <p className="text-sm font-bold text-green-600">✓ Thank you for your feedback!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
