"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Zap, 
  Coffee, 
  Clock, 
  Navigation, 
  ChevronRight,
  Info
} from 'lucide-react';
import { VenueService, QueueState } from '@/lib/types';

interface ServiceListItemProps {
  service: VenueService & Partial<QueueState>;
  index: number;
  onClick?: () => void;
}

export function ServiceListItem({ service, index, onClick }: ServiceListItemProps) {
  const iconMap: Record<string, React.ReactNode> = {
    food: <Utensils size={24} />,
    restroom: <Zap size={24} />,
    drink: <Coffee size={24} />,
    info: <Info size={24} />,
    gate: <Zap size={24} />, // Defaulting gate to Zap for now
  };

  const statusColors: Record<string, string> = {
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
      onClick={onClick}
      className="glass-card p-6 border-white/5 flex flex-col md:flex-row gap-6 items-center group cursor-pointer"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${statusColors[service.status || 'optimal']}`}>
        {iconMap[service.type] || <Info size={24} />}
      </div>
      
      <div className="flex-1 text-center md:text-left min-w-0">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <h3 className="text-xl font-black truncate">{service.name}</h3>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[service.status || 'optimal']}`}>
            {service.status}
          </span>
        </div>
        <p className="text-sm text-text-muted italic">{service.auraReason || service.reason}</p>
      </div>

      <div className="flex gap-8 items-center border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-text-muted mb-1">Queue</p>
          <div className="flex items-center gap-2 text-secondary font-black text-lg">
            <Clock size={16} />
            {service.waitRange || service.range}
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
