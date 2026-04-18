"use client";

interface MapTypeToggleProps {
  mapType: 'roadmap' | 'satellite';
  setMapType: (type: 'roadmap' | 'satellite') => void;
}

export function MapTypeToggle({ mapType, setMapType }: MapTypeToggleProps) {
  return (
    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden" role="tablist" aria-label="Map View Controls">
       <button 
         onClick={() => setMapType('roadmap')}
         aria-label="Switch to Roadmap View"
         aria-selected={mapType === 'roadmap'}
         role="tab"
         className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mapType === 'roadmap' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
       >
          Ground
       </button>
       <button 
         onClick={() => setMapType('satellite')}
         aria-label="Switch to Satellite View"
         aria-selected={mapType === 'satellite'}
         role="tab"
         className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mapType === 'satellite' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
       >
          Satellite
       </button>
    </div>
  );
}
