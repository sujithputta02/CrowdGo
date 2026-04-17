"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Clock, 
  Utensils, 
  Coffee, 
  Navigation, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { MOCK_VENUE_STATE } from '@/lib/mock-data';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { VenueState } from '@/lib/db';
import { MatchService } from '@/lib/services/match.service';
import { ArrivalService } from '@/lib/services/arrival.service';
import { useRouter } from 'next/navigation';

import { PredictionService, QueueState } from '@/lib/services/prediction.service';

export default function AppPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [venueData, setVenueData] = useState<VenueState | null>(null);
  const [prediction, setPrediction] = useState<QueueState | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const venueRef = doc(db, "venues", "wankhede");
    const unsubscribe = onSnapshot(venueRef, (doc) => {
      if (doc.exists()) {
        setVenueData(doc.data() as VenueState);
      }
    });

    return () => unsubscribe();
  }, []);

  // AI Prediction Bridge: Trigger Aura thinking when data shifts
  // Optimized with Debounce + AbortController to prevent request congestion during floods
  useEffect(() => {
    if (!venueData?.services?.[0]) return;

    const controller = new AbortController();
    
    const debounceTimer = setTimeout(async () => {
      setIsThinking(true);
      try {
        const res = await PredictionService.getQueueStatus(
          venueData.services[0].id,
          venueData.services[0].wait,
          venueData.services[0].type as any,
          controller.signal
        );
        setPrediction(res);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn("Prediction Request Failed:", err);
        }
      } finally {
        setIsThinking(false);
      }
    }, 1500); // 1.5s debounce for stability

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [venueData?.services?.[0]?.wait]); // Only trigger when the top service's wait time actually changes

  const userTicket = profile?.ticket || { section: '---', gate: '-', row: '-', seat: '-' };
  const services = venueData?.services || [];
  const notifications = venueData?.notifications || [];
  const activeMatch = venueData?.activeMatch || {
    home: "Loading...",
    away: "...",
    score: "0 - 0",
    time: "0'",
    nextBreak: "...",
    momentum: "low",
  };
  const arrival = ArrivalService.getRecommendation(userTicket.section);

  const startNavigation = () => {
    if (services[0]?.id) {
      router.push(`/map?serviceId=${services[0].id}`);
    } else {
      router.push('/map');
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-12 md:pt-8 bg-transparent">
      {/* Top Status Bar (Mobile Only) */}
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

      <main className="container mx-auto px-6 py-6 max-w-[1400px]">
        {/* Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Ticket & Actions */}
          <div className="md:col-span-3 space-y-8">
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">Identity</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                 <div className="glass-card p-5 border-white/5">
                    <p className="text-[10px] font-black uppercase text-text-muted mb-1">Gate</p>
                    <p className="text-2xl font-black">{userTicket.gate}</p>
                 </div>
                 <div className="glass-card p-5 border-white/5">
                    <p className="text-[10px] font-black uppercase text-text-muted mb-1">Section</p>
                    <p className="text-2xl font-black">{userTicket.section}</p>
                 </div>
              </div>
            </section>

            <section className="hidden md:block">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                <ActionButton 
                  icon={<Navigation size={20} />} 
                  label="Find Gate" 
                  aria-label="Find Stadium Gate"
                  color="primary" 
                  onClick={() => router.push('/map?target=gate')}
                />
                <ActionButton 
                  icon={<Zap size={20} />} 
                  label="Restrooms" 
                  aria-label="Find Restrooms"
                  color="secondary" 
                  onClick={() => router.push('/services?filter=restroom')}
                />
                <ActionButton 
                  icon={<Utensils size={20} />} 
                  label="Food & Drinks" 
                  aria-label="Explore Food and Drinks"
                  color="accent" 
                  onClick={() => router.push('/services?filter=food')}
                />
                <ActionButton 
                  icon={<MapPin size={20} />} 
                  label="My Seat" 
                  aria-label="Find My Seat"
                  color="white" 
                  onClick={() => router.push('/map?target=seat')}
                />
              </div>
            </section>
          </div>

          {/* CENTER COLUMN: Main Recommendation & Map */}
          <div className="md:col-span-6 space-y-8">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Smart Recommendation</h2>
                <div className="hidden md:flex gap-4">
                   <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-text-muted">Wankhede Stadium</div>
                </div>
              </div>
              
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
                    GO TO <span className="gradient-text">{(services[0]?.name || 'the concessions').toUpperCase()}</span> NOW
                  </h3>
                  <div className="mb-10">
                    <p className={`text-lg text-text-muted leading-relaxed transition-all ${isThinking ? 'opacity-30' : ''}`}>
                      {prediction?.auraReason || (services[0]?.reason || 'Analyzing stadium patterns for your section...')}.
                    </p>
                    {prediction?.confidence && !isThinking && (
                       <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <ShieldCheck size={14} className="text-secondary" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">AI Confidence: {prediction.confidence === 'high' ? '98%' : prediction.confidence === 'medium' ? '74%' : '42%'}</span>
                       </div>
                    )}
                  </div>
                  
                  <div className={`flex flex-wrap items-center gap-4 mb-10 transition-all ${isThinking ? 'opacity-30 grayscale' : ''}`}>
                    <div className="px-6 py-4 glass-card border-white/5 flex items-center gap-3">
                      <Navigation size={20} className="text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-50">Walking</p>
                        <p className="font-black italic">{services[0]?.walk || 0} MINS</p>
                      </div>
                    </div>
                    <div className="px-6 py-4 glass-card border-secondary/20 bg-secondary/5 flex items-center gap-3">
                      <Clock size={20} className="text-secondary" />
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-50">Wait Time</p>
                        <p className="font-black text-secondary italic">{prediction?.waitRange || '---'}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={startNavigation}
                    className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group"
                  >
                    Start Navigation
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Mobile Actions Grid (only visible on mobile) */}
            <section className="md:hidden">
              <div className="grid grid-cols-2 gap-4">
                <ActionButton icon={<Navigation />} label="Gate" color="primary" onClick={() => router.push('/map?target=gate')} />
                <ActionButton icon={<Zap />} label="Restroom" color="secondary" onClick={() => router.push('/services?filter=restroom')} />
                <ActionButton icon={<Utensils />} label="Food" color="accent" onClick={() => router.push('/services?filter=food')} />
                <ActionButton icon={<MapPin />} label="Seat" color="white" onClick={() => router.push('/map?target=seat')} />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Vibe, Match & Pings */}
          <div className="md:col-span-3 space-y-8">
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

            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50">Live Pings</h2>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="space-y-4">
                {notifications.map((n: any) => (
                  <div key={n.id} className="glass-card p-4 border-white/5 hover:border-primary/20 transition-colors flex gap-4 items-center group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{n.title}</p>
                      <p className="text-xs text-text-muted truncate">{n.message}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
  const colorMap: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    white: 'text-white bg-white/5 border-white/10',
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-5 rounded-2xl border flex items-center md:justify-start justify-center gap-4 transition-all hover:bg-white/10 ${colorMap[color]} w-full`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}
