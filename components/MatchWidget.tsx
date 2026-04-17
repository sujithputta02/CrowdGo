"use client";

import { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { MatchService, MatchState } from '@/lib/services/match.service';

interface MatchWidgetProps {
  estimatedTimeNeeded?: number; // in minutes
  showWarning?: boolean;
}

export default function MatchWidget({ estimatedTimeNeeded = 0, showWarning = false }: MatchWidgetProps) {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isSafeToLeave, setIsSafeToLeave] = useState(true);
  const [missedTime, setMissedTime] = useState(0);

  useEffect(() => {
    const updateMatchState = () => {
      const state = MatchService.getMatchStatus();
      setMatchState(state);

      if (estimatedTimeNeeded > 0) {
        const safe = MatchService.isOptimalMovementTime(estimatedTimeNeeded);
        setIsSafeToLeave(safe);
        
        if (!safe) {
          setMissedTime(Math.max(0, estimatedTimeNeeded - state.nextSafeWindowIn + 2));
        }
      }
    };

    updateMatchState();
    const interval = setInterval(updateMatchState, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [estimatedTimeNeeded]);

  if (!matchState) return null;

  return (
    <div className="space-y-4">
      {/* Match Status Card */}
      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-text-muted">
            Live Match
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-500">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">{matchState.home}</p>
              <p className="text-sm text-text-muted">{matchState.away}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">{matchState.score}</p>
              <p className="text-xs text-accent font-bold mt-1">{matchState.time}</p>
            </div>
          </div>

          {/* Momentum Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">Match Momentum</span>
              <span className="text-xs font-bold">{matchState.momentum}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${matchState.momentum}%` }}
              />
            </div>
          </div>

          {/* Next Break */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <Clock size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-xs text-text-muted">Next break in</p>
              <p className="text-sm font-bold">{matchState.nextSafeWindowIn} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movement Timing Warning */}
      {showWarning && estimatedTimeNeeded > 0 && (
        <div className={`p-4 rounded-xl border ${
          isSafeToLeave 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-start gap-3">
            {isSafeToLeave ? (
              <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold mb-1 ${
                isSafeToLeave ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {isSafeToLeave ? 'Safe to Leave' : 'Timing Warning'}
              </p>
              <p className="text-xs text-text-muted">
                {isSafeToLeave ? (
                  `You have enough time to complete this action (${estimatedTimeNeeded} min) and return before the next break.`
                ) : (
                  `You may miss approximately ${missedTime} minutes of play. Consider waiting ${matchState.nextSafeWindowIn} minutes for optimal timing.`
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimal Timing Suggestion */}
      {!isSafeToLeave && estimatedTimeNeeded > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-primary" />
            <p className="text-sm font-bold text-primary">Optimal Timing</p>
          </div>
          <p className="text-xs text-text-muted">
            Wait {matchState.nextSafeWindowIn} minutes and leave during the next break to avoid missing any action.
          </p>
        </div>
      )}
    </div>
  );
}
