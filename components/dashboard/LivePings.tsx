"use client";

import { Zap, ChevronRight } from 'lucide-react';
import { Notification } from '@/lib/types';

interface LivePingsProps {
  notifications: Notification[];
}

export function LivePings({ notifications }: LivePingsProps) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50">Live Pings</h2>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="glass-card p-4 border-white/5 hover:border-primary/20 transition-colors flex gap-4 items-center group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{n.title}</p>
              <p className="text-xs text-text-muted truncate">{n.message}</p>
            </div>
            <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-8 glass-card border-dashed border-white/5">
            <p className="text-xs text-text-muted italic">No new pings</p>
          </div>
        )}
      </div>
    </section>
  );
}
