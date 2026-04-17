"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Search, 
  Filter,
  ArrowRight,
  Maximize2,
  Compass,
  Clock,
  Sun,
  Moon,
  Layers
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { VenueState } from '@/lib/db';
import AuraMap from '@/components/AuraMap';
import { MapsService } from '@/lib/services/maps.service';
import { useSearchParams } from 'next/navigation';

export default function MapPage() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [venueData, setVenueData] = useState<VenueState | null>(null);
  const [isNightMode, setIsNightMode] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [activePolyline, setActivePolyline] = useState<string | undefined>();
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (venueData) {
      const target = searchParams.get('target');
      const serviceId = searchParams.get('serviceId');

      if (serviceId) {
        const service = venueData.services?.find(s => s.id === serviceId);
        if (service) {
           handleRoute(service.name, (MapsService as any).LOCATIONS['gate-1']);
        }
      } else if (target === 'gate') {
        handleRoute('Gate 1', (MapsService as any).LOCATIONS['gate-1']);
      } else if (target === 'seat') {
        handleRoute('My Seat', (MapsService as any).LOCATIONS['seat-a1']);
      }
    }
  }, [venueData, searchParams]);

  useEffect(() => {
    const venueRef = doc(db, "venues", "wankhede");
    const unsubscribe = onSnapshot(venueRef, (doc) => {
      if (doc.exists()) {
        setVenueData(doc.data() as VenueState);
      }
    });

    return () => unsubscribe();
  }, []);

  const userTicket = profile?.ticket || { section: '---', gate: '-', row: '-', seat: '-' };

  const handleRoute = async (destId: string, destCoords: { lat: number, lng: number }) => {
    setIsSearching(true);
    setActiveDestination(destId);
    setActivePolyline(undefined); // Clear old path while thinking
    
    try {
      const route = await MapsService.getWalkRoute(
        { latitude: (MapsService as any).LOCATIONS['gate-1'].lat, longitude: (MapsService as any).LOCATIONS['gate-1'].lng },
        { latitude: destCoords.lat, longitude: destCoords.lng }
      );
      if (route) {
        setActivePolyline(route.polyline.encodedPolyline);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePoiClick = (location: { lat: number, lng: number }, name: string) => {
    handleRoute(name, location);
  };

  return (
    <div className="min-h-screen md:pb-12 pt-8 flex flex-col">
      <main className="container mx-auto px-6 max-w-6xl flex-1 flex flex-col">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div role="banner">
            <h1 className="text-4xl font-black font-heading tracking-tighter uppercase leading-none mb-2">IPL Arena</h1>
            <p className="text-text-muted">Real-time W-Flow for Wankhede Stadium. Finding the W routes only.</p>
          </div>
          
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
        </header>

        {/* Search & Tool Bar */}
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
                 {MapsService.POINTS_OF_INTEREST.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(poi => (
                   <button 
                     key={poi.id}
                     onClick={() => {
                        handleRoute(poi.name, { lat: poi.lat, lng: poi.lng });
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

        {/* Map Visualization Area */}
        <div className={`relative glass-card border-white/5 rounded-[40px] overflow-hidden transition-all duration-700 group bg-black/20 ${isMaximized ? 'flex-1 mb-0' : 'h-[550px] mb-8'}`}>
           <AuraMap 
             isNightMode={isNightMode} 
             mapType={mapType} 
             polyline={activePolyline}
           />

           {/* Map Controls */}
           <div className="absolute bottom-6 right-6 flex flex-col gap-3">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className={`p-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:bg-white/5 transition-all ${isMaximized ? 'text-primary' : ''}`}
               >
                 <Maximize2 size={20} />
              </button>
              <button 
                onClick={() => { setActivePolyline(undefined); setActiveDestination(null); setIsMaximized(false); }}
                className="p-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:bg-white/5 transition-all"
              >
                 <Compass size={20} className="text-primary" />
              </button>
           </div>

           {/* Floating Info Panel */}
           <motion.div 
             initial={{ x: 300 }}
             animate={{ x: 0 }}
             className="absolute md:top-6 md:right-24 md:bottom-auto bottom-6 left-6 right-6 md:left-auto md:w-80 glass-card p-6 border-white/10 bg-background/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
           >
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Active Guidance</span>
              </div>
              <h3 className={`text-xl font-black mb-2 uppercase leading-tight font-heading transition-all ${isSearching ? 'opacity-30 blur-sm' : ''}`}>
                {activeDestination ? activeDestination.replace('-', ' ') : `Section ${userTicket.section}`}
              </h3>
              <p className={`text-sm text-text-muted mb-6 transition-all ${isSearching ? 'opacity-30' : ''}`}>
                {isSearching ? "Recalculating W-path via AI..." : activePolyline ? "W-route calculated for optimal aura." : "Select a point to begin W-routing."}
              </p>
              
              <div className="space-y-3 mb-8">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Walk time</span>
                    <span className="font-bold">{(venueData?.services?.[0]?.walk || 4)} mins</span>
                 </div>
                 <div className={`flex justify-between items-center text-xs ${venueData?.activeMatch?.momentum === 'high' ? 'text-primary' : 'text-secondary'}`}>
                    <span className="text-text-muted">Traffic level</span>
                    <span className="font-bold uppercase tracking-widest">
                       {venueData?.activeMatch?.momentum === 'high' ? 'Heavy' : 'Nominal'}
                    </span>
                 </div>
              </div>

              <button 
                onClick={() => {
                   setShowToast("AR Aura HUD Initialized. Please hold phone vertically.");
                   setTimeout(() => setShowToast(null), 4000);
                }}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group"
              >
                 Launch AR Flow
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </motion.div>
        </div>

        {/* Quick Location Shortcuts */}
        <section className="mb-12">
           <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">Nearby Points</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MapShortcut 
                label="Garware Pavilion" 
                time="2m" 
                icon={<Zap size={14} />} 
                onClick={() => handleRoute('Garware', (MapsService as any).LOCATIONS['gate-1'])}
              />
              <MapShortcut 
                label="Tendulkar Stand" 
                time="4m" 
                icon={<Navigation size={14} />} 
                onClick={() => handleRoute('Tendulkar', (MapsService as any).LOCATIONS['seat-a1'])}
              />
              <MapShortcut 
                label="Merchant Stand" 
                time="5m" 
                icon={<Clock size={14} />} 
                onClick={() => handleRoute('Merchant', (MapsService as any).LOCATIONS['gate-3'])}
              />
              <MapShortcut 
                label="Churchgate Hub" 
                time="8m" 
                icon={<MapPin size={14} />} 
                onClick={() => handleRoute('Churchgate', (MapsService as any).LOCATIONS['churchgate'])}
              />
           </div>
        </section>
      </main>

      {/* Floating Return to Seat Shortcut */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleRoute(`Seat ${userTicket.section}`, (MapsService as any).LOCATIONS['seat-a1'])}
        className="fixed bottom-32 right-6 md:bottom-12 md:right-12 z-40 bg-white text-black px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-[0_20px_60px_rgba(255,255,255,0.2)] flex items-center gap-3 border border-white/10"
      >
        <MapPin size={16} className="text-primary" />
        Back to Seat {userTicket.section}-{userTicket.row}
      </motion.button>

      {/* Persistence Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/40 border border-white/20"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MapShortcut({ label, time, icon, onClick }: { label: string, time: string, icon: any, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-4 flex items-center justify-between border-white/5 hover:border-primary/30 transition-all text-left group active:scale-95"
    >
       <div className="flex items-center gap-3">
          <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
       </div>
       <span className="text-[10px] font-bold text-text-muted">{time}</span>
    </button>
  );
}
