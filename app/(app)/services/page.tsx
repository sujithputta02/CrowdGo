"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Coffee, 
  Zap, 
  Info, 
  ChevronRight, 
  Clock, 
  Navigation,
  Search,
  Filter
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { VenueState } from '@/lib/db';
import { PredictionService, QueueState } from '@/lib/services/prediction.service';
import { useSearchParams } from 'next/navigation';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const [venueData, setVenueData] = useState<VenueState | null>(null);
  const [filter, setFilter] = useState(initialFilter);

  const [predictions, setPredictions] = useState<Record<string, QueueState>>({});

  useEffect(() => {
    // Sync filter if query param changes
    const f = searchParams.get('filter');
    if (f) setFilter(f);
  }, [searchParams]);

  useEffect(() => {
    const venueRef = doc(db, "venues", "wankhede");
    const unsubscribe = onSnapshot(venueRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as VenueState;
        setVenueData(data);
        
        // Fetch AI updates for all services
        data.services?.forEach(async (s) => {
          const pred = await PredictionService.getQueueStatus(s.id, s.wait, s.type as any);
          setPredictions(prev => ({ ...prev, [s.id]: pred }));
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const services = (venueData?.services || []).map(s => {
    const prediction = predictions[s.id];
    return { ...s, ...prediction };
  });

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.type === filter);

  return (
    <div className="min-h-screen pb-32 md:pb-12 pt-8">
      <main className="container mx-auto px-6 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 font-heading tracking-tighter uppercase">Services</h1>
          <p className="text-text-muted text-lg">W-rankings of every hub in the venue. Check the wait, hit the flow.</p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search food, drinks, or gates..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['all', 'food', 'restroom', 'drink'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-4 rounded-2xl border font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap ${filter === f ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {filteredServices.map((service, index) => (
            <ServiceListItem key={service.id} service={service} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

function ServiceListItem({ service, index }: { service: any, index: number }) {
  const iconMap: any = {
    food: <Utensils size={24} />,
    restroom: <Zap size={24} />,
    drink: <Coffee size={24} />,
  };

  const statusColors: any = {
    optimal: 'text-primary bg-primary/10 border-primary/20',
    'locked-in': 'text-secondary bg-secondary/10 border-secondary/20',
    busy: 'text-accent bg-accent/10 border-accent/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card p-6 border-white/5 flex flex-col md:flex-row gap-6 items-center group cursor-pointer"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${statusColors[service.status]}`}>
        {iconMap[service.type]}
      </div>
      
      <div className="flex-1 text-center md:text-left min-w-0">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <h3 className="text-xl font-black truncate">{service.name}</h3>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[service.status]}`}>
            {service.status}
          </span>
        </div>
        <p className="text-sm text-text-muted italic">{service.reason}</p>
      </div>

      <div className="flex gap-8 items-center border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-text-muted mb-1">Queue</p>
          <div className="flex items-center gap-2 text-secondary font-black text-lg">
            <Clock size={16} />
            {service.range}
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-text-muted mb-1">Walking</p>
          <div className="flex items-center gap-2 font-black text-lg">
            <Navigation size={16} className="text-primary" />
            {service.walk}m
          </div>
        </div>
        <div className="hidden md:block">
          <ChevronRight size={24} className="text-text-muted group-hover:text-white transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
