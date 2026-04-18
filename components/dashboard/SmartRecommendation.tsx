"use client";

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Navigation, Clock, ArrowRight } from 'lucide-react';
import { VenueService, QueueState } from '@/lib/types';

interface SmartRecommendationProps {
  isThinking: boolean;
  service?: VenueService;
  prediction: QueueState | null;
  onNavigate: () => void;
}

export function SmartRecommendation({ isThinking, service, prediction, onNavigate }: SmartRecommendationProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      role="region"
      aria-label="Smart AI Recommendation"
      className="group relative overflow-hidden rounded-[40px] p-8 md:p-12 border-2 border-primary/30 bg-gradient-to-br from-primary/20 via-background to-background shadow-[0_0_80px_rgba(139,92,246,0.1)]"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Zap size={200} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] font-black uppercase text-text-muted tracking-widest italic">
            {isThinking ? 'Analyzing Patterns...' : 'Calculated by Vertex AI'}
          </span>
        </div>
        <h3 className={`text-4xl md:text-5xl font-black mb-6 leading-tight transition-all ${isThinking ? 'opacity-30 blur-sm' : ''}`}>
          GO TO <span className="gradient-text">{(service?.name || 'the concessions').toUpperCase()}</span> NOW
        </h3>
        <div className="mb-10">
          <p className={`text-lg text-text-muted leading-relaxed transition-all ${isThinking ? 'opacity-30' : ''}`}>
            {prediction?.recommendation || (service as any)?.reason || 'Analyzing stadium patterns for your section...'}.
          </p>
          {(prediction as any)?.confidence && !isThinking && (
             <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <ShieldCheck size={14} className="text-secondary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">AI Confidence: {(prediction as any).confidence === 'high' ? '98%' : (prediction as any).confidence === 'medium' ? '74%' : '42%'}</span>
             </div>
          )}
        </div>
        
        <div className={`flex flex-wrap items-center gap-4 mb-10 transition-all ${isThinking ? 'opacity-30 grayscale' : ''}`}>
          <div className="px-6 py-4 glass-card border-white/5 flex items-center gap-3">
            <Navigation size={20} className="text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase opacity-50">Walking</p>
              <p className="font-black italic">{(service as any)?.walk || 0} MINS</p>
            </div>
          </div>
          <div className="px-6 py-4 glass-card border-secondary/20 bg-secondary/5 flex items-center gap-3">
            <Clock size={20} className="text-secondary" />
            <div>
              <p className="text-[10px] font-black uppercase opacity-50">Wait Time</p>
              <p className="font-black text-secondary italic">{(prediction as any)?.waitRange || '---'}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onNavigate}
          className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group"
        >
          Start Navigation
          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
