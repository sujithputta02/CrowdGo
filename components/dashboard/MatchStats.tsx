import { VenueState } from '@/lib/types';

interface MatchStatsProps {
  activeMatch: NonNullable<VenueState['activeMatch']>;
  arrival: {
    arrivalWindow: string;
    status: string;
  };
}

export function MatchStats({ activeMatch, arrival }: MatchStatsProps) {
  return (
    <section className="glass-card p-6 border-white/5 overflow-hidden">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-50">Match Stats</h2>
      <div className="space-y-6">
         <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-black">{activeMatch.score}</p>
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Current Score</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-accent uppercase">{activeMatch.time}</p>
            </div>
         </div>
         <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black uppercase text-text-muted mb-2 tracking-widest">Arrival Window</p>
            <div className="flex justify-between items-center">
               <span className="text-2xl font-black">{arrival.arrivalWindow}</span>
               <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${arrival.status === 'on-time' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                  {arrival.status}
               </div>
            </div>
         </div>
      </div>
    </section>
  );
}
