"use client";

import { Search, MapPin, Moon, Sun } from 'lucide-react';
import { Location } from '@/lib/types';

interface MapSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNightMode: boolean;
  setIsNightMode: (mode: boolean) => void;
  pois: Array<{ id: string, name: string, lat: number, lng: number }>;
  onPoiClick: (name: string, location: Location) => void;
}

export function MapSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  isNightMode, 
  setIsNightMode, 
  pois, 
  onPoiClick 
}: MapSearchBarProps) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1 relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
         <input 
           type="text" 
           placeholder="Find Section, Restroom, or Snack..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
         />
         {searchQuery && (
           <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card p-2 border-white/10 max-h-60 overflow-y-auto">
             {pois.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(poi => (
               <button 
                 key={poi.id}
                 onClick={() => {
                    onPoiClick(poi.name, { lat: poi.lat, lng: poi.lng });
                    setSearchQuery('');
                 }}
                 className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3"
               >
                 <MapPin size={14} className="text-secondary" />
                 <span className="text-sm">{poi.name}</span>
               </button>
             ))}
           </div>
         )}
      </div>
       <button 
         onClick={() => setIsNightMode(!isNightMode)}
         className="glass-card p-4 border-white/5 hover:border-white/20 transition-all text-primary"
       >
          {isNightMode ? <Moon size={20} /> : <Sun size={20} />}
       </button>
    </div>
  );
}
