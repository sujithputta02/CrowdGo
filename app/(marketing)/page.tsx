"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Clock, 
  Activity, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  Navigation,
  Eye,
  BarChart3,
  Coffee
} from 'lucide-react';

// Common Transition
const spring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1
} as const;

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <div className="relative min-h-screen Selection:bg-primary Selection:text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-4 bg-background/80 backdrop-blur-xl border-b border-white/5' : 'py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-white w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter font-heading">Crowd<span className="gradient-text">Go</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="hover:text-white transition-colors">Vibe Check</a>
            <a href="#dashboard" className="hover:text-white transition-colors">God View</a>
            <a href="#benefits" className="hover:text-white transition-colors">Match Protection</a>
          </div>

          <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-xl">
            Get App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10 overflow-hidden">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-8 inline-block">
              // Version 1.1 Out Now
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
                {/* Simulated UI */}
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
                       {/* Animated circles/map simulation */}
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

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 z-10 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 font-heading">THE PLAYBOOK FOR <span className="gradient-text">W FLOW.</span></h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              We tracked the crowd so you don't have to. Maximize your stadium aura with real-time intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Navigation className="w-8 h-8 text-primary" />}
              title="Smart Arrival"
              desc="No cap, we find the fastest gate for your ticket. Skip the congestion and enter like the main character."
              tag="SPEEDRUN"
            />
            <FeatureCard 
              icon={<Coffee className="w-8 h-8 text-secondary" />}
              title="W Snack Runs"
              desc="Vibe check every concession stand. We find the shortest lines for your half-time cravings."
              tag="FAST PASS"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-accent" />}
              title="Match Protection"
              desc="Never miss a goal again. We tell you the perfect moment to leave your seat and return before kickoff."
              tag="LOCKED IN"
            />
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-20 bg-white/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-5xl font-black gradient-text mb-2">94%</p>
              <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Wait Time Reduction</p>
            </div>
            <div>
              <p className="text-5xl font-black gradient-text mb-2">2.5k</p>
              <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Avg Stats Saved</p>
            </div>
            <div>
              <p className="text-5xl font-black gradient-text mb-2">Zero</p>
              <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Missed Match Moments</p>
            </div>
            <div>
              <p className="text-5xl font-black gradient-text mb-2">10/10</p>
              <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Vibe Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-32 px-6">
        <div className="container mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <span className="text-primary font-black tracking-widest text-xs uppercase mb-4 block">VENUE OPERATORS ONLY</span>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight font-heading">GOD VIEW.<br />POWERED BY <span className="gradient-text">AI.</span></h2>
            <p className="text-xl text-text-muted mb-10 leading-relaxed">
              Every fan, every gate, every drink — managed in one dashboard. Predict surges before they happen and keep the stadium vibes immaculate.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Real-time Surge Alerts</p>
                  <p className="text-sm text-text-muted italic">Detect bottlenecks before they turn into L's.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center mt-1">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="font-bold">Automated Staff Nudging</p>
                  <p className="text-sm text-text-muted italic">Smart dispatch to clear the way.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 p-4 bg-background border border-white/10 rounded-3xl shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
               <div className="p-8 aspect-square flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm text-text-muted font-bold uppercase tracking-wider mb-2">CROWD DENSITY</h4>
                      <p className="text-3xl font-black">72.4k <span className="text-xs text-secondary ml-2">LIVE</span></p>
                    </div>
                    <div className="w-24 h-12 flex items-end gap-1">
                      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${h * 100}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 glass-card p-6 flex flex-col gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase opacity-50">Gate 1 Ingress</span>
                        <span className="text-xs font-bold text-accent">HEAVY</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-accent" />
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase opacity-50">South Concourse</span>
                        <span className="text-xs font-bold text-secondary">CLEAR</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-secondary" />
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-accent/20">
                      <p className="text-xs font-black text-accent uppercase mb-2">ACTION REQUIRED</p>
                      <p className="text-sm">Redeploy 3 stewards to North Gate. Surge predicted in T-minus 4 minutes.</p>
                      <button className="mt-4 w-full py-2 bg-accent rounded font-bold text-xs uppercase tracking-tight">Dispatch Now</button>
                    </div>
                  </div>
               </div>
            </div>
            {/* Background elements for depth */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-12 font-heading tracking-tighter">UPGRADE TO <span className="gradient-text">W VIBES.</span></h2>
          <p className="text-text-muted mb-16 max-w-xl mx-auto text-xl">
            Don't let L lines ruin your match day. Join the next generation of smart stadium movement.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button className="px-12 py-6 bg-white text-black rounded-3xl font-black text-xl hover:scale-105 transition-transform flex items-center justify-center gap-4">
              Download App
              <ArrowRight className="w-6 h-6" />
            </button>
            <button className="px-12 py-6 glass-card rounded-3xl font-black text-xl hover:bg-white/10 transition-colors">
              Request Info
            </button>
          </div>
          <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="text-primary w-5 h-5" fill="currentColor" />
              <span className="text-xl font-extrabold tracking-tighter">CrowdGo</span>
            </div>
            <div className="flex gap-10 text-sm text-text-muted font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Insta</a>
              <a href="#" className="hover:text-white transition-colors">X (fka Twitter)</a>
            </div>
            <p className="text-text-muted text-xs">© 2026 CrowdGo. No Cap. No Waiting.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, tag }: { icon: any, title: string, desc: string, tag: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card p-10 flex flex-col items-start gap-8 relative group cursor-default"
    >
      <div className="absolute top-6 right-8 text-[10px] font-black text-text-muted tracking-[0.2em] group-hover:text-primary transition-colors">
        [{tag}]
      </div>
      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black mb-4 font-heading">{title}</h3>
        <p className="text-text-muted leading-relaxed">{desc}</p>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-secondary" 
        />
      </div>
    </motion.div>
  );
}
