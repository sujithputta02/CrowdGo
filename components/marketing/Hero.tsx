"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Activity } from 'lucide-react';
import { spring } from './shared';

export function Hero() {
  return (
    <section className="relative pt-40 pb-20 px-6 z-10 overflow-hidden">
      <div className="container mx-auto text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-8 inline-block">
            Version 1.1 Out Now
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1] font-heading"
        >
          GO SMARTER.<br />
          WAIT LESS.<br />
          <span className="gradient-text animate-pulse-slow">MISS NOTHING.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Real-time crowd orchestration for the main characters. 
          No more L lines, just W movement. Locked in for the ultimate match vibe. 
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <Link href="/main" className="px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-lg hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all flex items-center gap-3 group no-underline">
            Start Moving
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-10 py-5 glass-card font-bold text-lg hover:bg-white/10 transition-colors">
            Request Demo
          </button>
        </motion.div>
      </div>

      {/* Floating Mockup Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.6 }}
        className="mt-24 container mx-auto max-w-4xl relative"
      >
        <div className="glass-card p-4 md:p-8 aspect-video flex flex-col items-center justify-center overflow-hidden group">
           <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#111] to-[#222] border border-white/10 relative shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col">
                {/* Top Bar */}
                <div className="p-4 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white/50">MATCH LIVE: MUMBAI INDIANS vs GUJARAT TITANS</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-accent/20 text-accent text-[10px] font-bold">LIVE STADIUM VIEW</div>
                </div>
                {/* Content Area */}
                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col justify-center">
                    <h3 className="text-3xl font-black mb-4">RESTROOM SPEEDRUN</h3>
                    <p className="text-text-muted mb-6">Zone C is clear. 2 min walk, 0 min wait. Go now and miss zero action.</p>
                    <div className="flex gap-4">
                      <div className="glass-card p-4 flex-1">
                        <p className="text-[10px] text-text-muted uppercase mb-1">Walking</p>
                        <p className="text-xl font-bold">2 MINS</p>
                      </div>
                      <div className="glass-card p-4 flex-1 border-secondary/30 bg-secondary/10">
                        <p className="text-[10px] text-secondary uppercase mb-1">Queue</p>
                        <p className="text-xl font-bold text-secondary">0 MINS</p>
                      </div>
                    </div>
                    <button className="mt-8 py-3 bg-primary rounded-xl font-bold">Navigate Now</button>
                  </div>
                  <div className="hidden md:flex items-center justify-center relative">
                     <div className="w-64 h-64 border-2 border-white/5 rounded-full flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-primary/20 rounded-full flex items-center justify-center animate-pulse-slow">
                           <div className="w-32 h-32 border-2 border-secondary/20 rounded-full flex items-center justify-center">
                              <Activity className="text-primary w-12 h-12" />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </motion.div>
    </section>
  );
}
