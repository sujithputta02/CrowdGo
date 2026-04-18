import { Zap } from 'lucide-react';
import { MatchState } from '@/lib/types';

interface AppHeaderProps {
  activeMatch: MatchState;
}

export function AppHeader({ activeMatch }: AppHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap size={18} className="text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">{activeMatch.home} {activeMatch.score} {activeMatch.away}</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-accent">{activeMatch.time}</span>
        </div>
      </div>
    </header>
  );
}
