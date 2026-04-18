"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Maximize2,
  Compass,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useVenueState } from '@/lib/hooks/use-venue-state';
import { useSearchParams } from 'next/navigation';

import AuraMap from '@/components/AuraMap';
import { MapsService } from '@/lib/services/maps.service';
import { Location } from '@/lib/types';

import { MapTypeToggle } from '@/components/dashboard/MapTypeToggle';
import { MapSearchBar } from '@/components/dashboard/MapSearchBar';
import { MapGuidancePanel } from '@/components/dashboard/MapGuidancePanel';
import { MapShortcut } from '@/components/dashboard/MapShortcut';

export default function MapPage() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const { venueData, activeMatch } = useVenueState();
  
  const [isNightMode, setIsNightMode] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [activePolyline, setActivePolyline] = useState<string | undefined>();
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleRoute = async (destId: string, destCoords: Location) => {
    setIsSearching(true);
    setActiveDestination(destId);
    setActivePolyline(undefined);
    
    try {
      const origin = MapsService.LOCATIONS['gate-1'];
      const route = await MapsService.getWalkRoute(
        { latitude: origin.lat, longitude: origin.lng },
        { latitude: destCoords.lat, longitude: destCoords.lng }
      );
      if (route) {
        setActivePolyline(route.polyline.encodedPolyline);
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (venueData) {
      const target = searchParams.get('target');
      const serviceId = searchParams.get('serviceId');

      if (serviceId) {
        const service = venueData.services?.find(s => s.id === serviceId);
        if (service) {
           handleRoute(service.name, MapsService.LOCATIONS['gate-1']);
        }
      } else if (target === 'gate') {
        handleRoute('Gate 1', MapsService.LOCATIONS['gate-1']);
      } else if (target === 'seat') {
        handleRoute('My Seat', MapsService.LOCATIONS['seat-a1']);
      }
    }
  }, [venueData, searchParams]);

  const userTicket = profile?.ticket || { section: '---', gate: '-', row: '-', seat: '-' };

  return (
    <div className="min-h-screen md:pb-12 pt-8 flex flex-col">
      <main className="container mx-auto px-6 max-w-6xl flex-1 flex flex-col">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div role="banner">
            <h1 className="text-4xl font-black font-heading tracking-tighter uppercase leading-none mb-2">IPL Arena</h1>
            <p className="text-text-muted">Real-time W-Flow for Wankhede Stadium. Finding the W routes only.</p>
          </div>
          
          <MapTypeToggle mapType={mapType} setMapType={setMapType} />
        </header>

        <MapSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isNightMode={isNightMode}
          setIsNightMode={setIsNightMode}
          pois={MapsService.POINTS_OF_INTEREST}
          onPoiClick={handleRoute}
        />

        <div className={`relative glass-card border-white/5 rounded-[40px] overflow-hidden transition-all duration-700 group bg-black/20 ${isMaximized ? 'flex-1 mb-0' : 'h-[550px] mb-8'}`}>
           <AuraMap 
             isNightMode={isNightMode} 
             mapType={mapType} 
             polyline={activePolyline}
           />

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

           <MapGuidancePanel 
             activeDestination={activeDestination}
             activePolyline={activePolyline}
             isSearching={isSearching}
             userTicket={userTicket}
             walkTime={venueData?.services?.[0]?.walk || 4}
             trafficLevel={activeMatch?.momentum === 'high' ? 'Heavy' : 'Nominal'}
             onLaunchAR={() => {
                setShowToast("AR Aura HUD Initialized. Please hold phone vertically.");
                setTimeout(() => setShowToast(null), 4000);
             }}
           />
        </div>

        <section className="mb-12">
           <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">Nearby Points</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MapShortcut 
                label="Garware Pavilion" 
                time="2m" 
                icon={<Zap size={14} />} 
                onClick={() => handleRoute('Garware', MapsService.LOCATIONS['gate-1'])}
              />
              <MapShortcut 
                label="Tendulkar Stand" 
                time="4m" 
                icon={<Navigation size={14} />} 
                onClick={() => handleRoute('Tendulkar', MapsService.LOCATIONS['seat-a1'])}
              />
              <MapShortcut 
                label="Merchant Stand" 
                time="5m" 
                icon={<Clock size={14} />} 
                onClick={() => handleRoute('Merchant', MapsService.LOCATIONS['gate-3'])}
              />
              <MapShortcut 
                label="Churchgate Hub" 
                time="8m" 
                icon={<MapPin size={14} />} 
                onClick={() => handleRoute('Churchgate', MapsService.LOCATIONS['churchgate'])}
              />
           </div>
        </section>
      </main>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleRoute(`Seat ${userTicket.section}`, MapsService.LOCATIONS['seat-a1'])}
        className="fixed bottom-32 right-6 md:bottom-12 md:right-12 z-40 bg-white text-black px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-[0_20px_60px_rgba(255,255,255,0.2)] flex items-center gap-3 border border-white/10"
      >
        <MapPin size={16} className="text-primary" />
        Back to Seat {userTicket.section}-{userTicket.row}
      </motion.button>

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
