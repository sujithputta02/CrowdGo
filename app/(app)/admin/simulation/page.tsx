"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Send,
  CheckCircle2,
  Trash2,
  Settings,
  ChevronRight,
  Zap,
  Shield,
  BarChart3,
  Waves
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SimulationDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFlooding, setIsFlooding] = useState(false);
  const floodIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [eventsSent, setEventsSent] = useState(0);
  const [surgeProbability, setSurgeProbability] = useState(12);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (floodIntervalRef.current) clearInterval(floodIntervalRef.current);
    };
  }, []);

  // Live Surge Intelligence Bridge
  useEffect(() => {
    if (isFlooding) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/v1/predict', {
            method: 'POST',
            body: JSON.stringify({ facilityId: 'gate-1', type: 'gate', currentWait: 10 })
          });
          const data = await res.json();
          if (data.momentumFactors) {
            // Map the surge factor (1.0 - 2.0+) to a percentage
            const prob = Math.min(Math.round((parseFloat(data.momentumFactors.surgeFactor) - 1) * 100), 99);
            setSurgeProbability(Math.max(prob, 8)); // Floor of 8% for visual vibe
          }
        } catch (e) {
          console.error("Pulse Sync Error:", e);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isFlooding]);

  const fireEvent = async (type: string, payload: any, fromFlood: boolean = false) => {
    if (!fromFlood) setLoading(true);
    setSuccess(null);
    try {
      const eventData = {
        type,
        payload,
        timestamp: Date.now()
      };
      
      const base64Data = btoa(JSON.stringify(eventData));
      
      const response = await fetch('/api/v1/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PubSub-Secret': 'crowdgo_aura_secret_2026'
        },
        body: JSON.stringify({
          message: {
            data: base64Data,
            messageId: Math.random().toString(36).substring(7),
            publishTime: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        if (fromFlood) setEventsSent(prev => prev + 1);
        if (!fromFlood) {
          setSuccess(`Event Sent: ${type}`);
          setTimeout(() => setSuccess(null), 3000);
        }
      }
    } catch (error) {
       console.error("Simulation Error:", error);
    } finally {
      if (!fromFlood) setLoading(false);
    }
  };

  const startFlooding = () => {
    if (isFlooding) {
      if (floodIntervalRef.current) {
        clearInterval(floodIntervalRef.current);
        floodIntervalRef.current = null;
      }
      setIsFlooding(false);
      setSuccess("Simulation Stopped.");
      return;
    }

    setIsFlooding(true);
    setEventsSent(0);
    setSuccess("IPL Match Simulation Running...");
    
    floodIntervalRef.current = setInterval(() => {
      const types = ['GATE_SCAN', 'POS_SALE'];
      const gates = ['gate-1', 'gate-3', 'gate-5'];
      const hubs = ['food-1', 'food-2', 'churchgate'];
      
      const randomType = types[Math.floor(Math.random() * types.length)];
      if (randomType === 'GATE_SCAN') {
        fireEvent('GATE_SCAN', { gateId: gates[Math.floor(Math.random() * gates.length)] }, true);
      } else {
        fireEvent('POS_SALE', { hubId: hubs[Math.floor(Math.random() * hubs.length)], amount: Math.floor(Math.random() * 50) + 10 }, true);
      }
    }, 600);
  };

  const resetVenue = async () => {
    setLoading(true);
    try {
       const venueRef = doc(db, "venues", "wankhede");
       await setDoc(venueRef, {
         name: "Wankhede Stadium",
         activeMatch: {
           home: "Mumbai Indians",
           away: "Chennai Super Kings",
           score: "0 - 0",
           time: "0'",
           momentum: "stable",
         },
         metadata: {
           status: "OPERATIONAL",
           alerts: 0,
           uptime: "99.9%"
         }
       });
       setSuccess("Venue State Reset");
       setTimeout(() => setSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Col: Main Control */}
        <div className="space-y-8">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.4em] text-[10px]">
                <Shield size={14} className={isFlooding ? 'animate-pulse text-accent' : ''} />
                Sector HQ | Wankhede Operational
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase font-heading italic">
                Mission <span className="text-primary">Control</span>
              </h1>
            </div>

            <div className="flex gap-4">
               <button 
                onClick={resetVenue}
                disabled={loading}
                className="p-4 rounded-2xl glass-panel hover:bg-white/5 transition-colors text-zinc-500"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={startFlooding}
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden ${isFlooding ? 'bg-accent text-white' : 'bg-primary text-white overflow-hidden'}`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                {isFlooding ? <Zap size={16} className="animate-bounce" /> : <Send size={16} />}
                <span className="relative z-10">{isFlooding ? 'TERMINATE RUN' : 'INITIALIZE SIM'}</span>
              </button>
            </div>
          </header>

          {/* Core Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
             <StatCard 
              label="Archived Events" 
              value={eventsSent.toLocaleString()} 
              icon={<Waves size={24} className="text-secondary" />}
              subtext="Streamed to BigQuery"
              active={isFlooding}
             />
             <StatCard 
              label="Venue Status" 
              value={isFlooding ? "ACTIVE" : "STANDBY"} 
              icon={<Shield size={24} className={isFlooding ? 'text-accent animate-pulse' : 'text-zinc-500'} />}
              subtext="Aura Infrastructure"
             />
             <StatCard 
              label="Predictive Budget" 
              value="1.0h" 
              icon={<Activity size={24} className="text-primary" />}
              subtext="AutoML Tabular"
             />
          </div>

          {/* Interaction Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingress Section */}
            <div className="glass-card p-1 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-black italic uppercase tracking-widest text-xs flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Entry Simulation
                  </h3>
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
               </div>
               <div className="p-6 space-y-3">
                  <ControlBtn 
                    title="Gate 1: Peak Rush" 
                    onClick={() => fireEvent('GATE_SCAN', { gateId: 'gate-1' })}
                    loading={loading}
                   />
                   <ControlBtn 
                    title="Gate 3: Maintenance" 
                    onClick={() => fireEvent('GATE_SCAN', { gateId: 'gate-3' })}
                    loading={loading}
                    variant="accent"
                   />
               </div>
            </div>

            {/* Commerce Section */}
            <div className="glass-card p-1 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-black italic uppercase tracking-widest text-xs flex items-center gap-2">
                    <CreditCard size={16} className="text-secondary" />
                    POS Transactions
                  </h3>
                  <div className="h-2 w-2 rounded-full bg-secondary" />
               </div>
               <div className="p-6 space-y-3">
                  <ControlBtn 
                    title="Sector A: High Demand" 
                    onClick={() => fireEvent('POS_SALE', { hubId: 'food-1' })}
                    loading={loading}
                    variant="secondary"
                   />
                   <ControlBtn 
                    title="Garware: Service Spike" 
                    onClick={() => fireEvent('POS_SALE', { hubId: 'food-2' })}
                    loading={loading}
                    variant="secondary"
                   />
               </div>
            </div>
          </div>

          {/* Incident Control */}
          <section className="glass-card p-8 border-primary/10 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 grid md:grid-cols-[1fr_250px] gap-8 items-center">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-accent font-black uppercase text-[10px] tracking-widest">
                      <AlertTriangle size={14} />
                      Emergency Override
                   </div>
                   <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Incident Dispatch</h2>
                   <p className="text-zinc-500 text-sm max-w-md italic">Trigger high-priority alerts to test real-time rerouting logic and predictive surge adjustments.</p>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => fireEvent('INCIDENT', { type: 'SPILL', location: 'Section A1', severity: 'low' })}
                        className="px-8 py-4 rounded-xl bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] transition-all"
                      >
                        Deploy Maintenance
                      </button>
                   </div>
                </div>
                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-4 border-white/10">
                   <Settings className="text-primary animate-spin-slow" size={32} />
                   <div className="space-y-1">
                      <p className="font-black text-[10px] uppercase tracking-widest text-zinc-300">Reroute Engine</p>
                      <p className="text-[10px] text-zinc-500 font-mono">CODE: ACTIVE_99x</p>
                   </div>
                </div>
            </div>
          </section>
        </div>

        {/* Right Col: Surge Intelligence */}
        <aside className="space-y-8">
           <div className="glass-card p-8 min-h-[500px] flex flex-col">
              <div className="pb-6 border-b border-white/5 flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Live Intelligence</p>
                   <h2 className="text-2xl font-black italic tracking-tighter uppercase">Surge Pulse</h2>
                </div>
                <BarChart3 className="text-zinc-600" size={24} />
              </div>

              <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-12">
                 
                 {/* Surge Meter */}
                 <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle 
                        cx="96" cy="96" r="88" 
                        className="stroke-white/5 fill-none" 
                        strokeWidth="12" 
                       />
                       <motion.circle 
                        cx="96" cy="96" r="88" 
                        className="stroke-primary fill-none shadow-[0_0_20px_rgba(139,92,246,0.5)]" 
                        strokeWidth="12" 
                        strokeDasharray="553"
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * surgeProbability) / 100 }}
                        strokeLinecap="round"
                       />
                    </svg>
                    <div className="text-center">
                       <p className="text-5xl font-black tracking-tighter italic">{surgeProbability}%</p>
                       <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">Probability</p>
                    </div>
                 </div>

                 <div className="w-full space-y-6">
                    <InsightItem 
                      label="Incoming Load" 
                      value="Critical" 
                      color="text-accent" 
                      desc="Gate 1 influx exceeds capacity" 
                    />
                    <InsightItem 
                      label="Service Lag" 
                      value="+4.2m" 
                      color="text-secondary" 
                      desc="Concession queue accumulating" 
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-auto">
                 <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <Zap className="text-primary fill-primary" size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-relaxed">
                       ML Model Training<br/><span className="text-zinc-400">V4_BQML | 94% SYNC</span>
                    </p>
                 </div>
              </div>
           </div>
        </aside>

      </div>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-[0_20px_60px_rgba(255,255,255,0.2)]"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, subtext, active }: any) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 group hover:bg-white/[0.05] transition-colors relative overflow-hidden">
      {active && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-ping" />}
      <div className="flex justify-between items-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</p>
         {icon}
      </div>
      <div>
         <p className="text-3xl font-black tracking-tighter italic uppercase">{value}</p>
         <p className="text-[10px] text-zinc-500 font-mono mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function ControlBtn({ title, onClick, loading, variant = 'primary' }: any) {
  const styles: any = {
    primary: 'hover:border-primary/50 text-zinc-300 hover:text-primary active:bg-primary/5',
    secondary: 'hover:border-secondary/50 text-zinc-300 hover:text-secondary active:bg-secondary/5',
    accent: 'hover:border-accent/50 text-zinc-300 hover:text-accent active:bg-accent/5',
  };

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`w-full group px-6 py-5 rounded-2xl glass-panel text-left flex items-center justify-between transition-all ${styles[variant]} disabled:opacity-50`}
    >
      <span className="font-black uppercase tracking-[0.2em] text-[10px]">{title}</span>
      <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function InsightItem({ label, value, color, desc }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 group hover:bg-white/[0.04] transition-colors">
       <div className="flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{value}</span>
       </div>
       <p className="text-[10px] text-zinc-400 italic leading-relaxed">{desc}</p>
    </div>
  );
}
