"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface MapGuidancePanelProps {
  activeDestination: string | null;
  activePolyline?: string;
  isSearching: boolean;
  userTicket: { section: string };
  walkTime: number;
  trafficLevel: 'Heavy' | 'Nominal';
  onLaunchAR: () => void;
}

export function MapGuidancePanel({ 
  activeDestination, 
  activePolyline, 
  isSearching, 
  userTicket, 
  walkTime, 
  trafficLevel,
  onLaunchAR
}: MapGuidancePanelProps) {
  return (
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
            <span className="font-bold">{walkTime} mins</span>
         </div>
         <div className={`flex justify-between items-center text-xs ${trafficLevel === 'Heavy' ? 'text-primary' : 'text-secondary'}`}>
            <span className="text-text-muted">Traffic level</span>
            <span className="font-bold uppercase tracking-widest">{trafficLevel}</span>
         </div>
      </div>

      <button 
        onClick={onLaunchAR}
        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group"
      >
         Launch AR Flow
         <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
