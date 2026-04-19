"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  Download,
  Share2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { MOCK_VENUE_STATE } from '@/lib/mock-data';

export default function TicketPage() {
  const { userTicket } = MOCK_VENUE_STATE;

  return (
    <div className="min-h-screen pb-32 md:pb-12 pt-8 flex flex-col items-center">
      <main className="container mx-auto px-6 max-w-xl text-center">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 font-heading tracking-tighter uppercase leading-none">Your Ticket</h1>
          <p className="text-text-muted">Aura is high. You&apos;re locked in for Section {userTicket.section}.</p>
        </header>

        {/* Digital Ticket Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group mb-12"
        >
          {/* Ticket Header (Punch-hole effect) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background z-10 border-b border-white/5" />
          
          <div className="bg-white text-black p-8 rounded-[40px] shadow-2xl overflow-hidden text-left">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" fill="currentColor" />
                </div>
                <span className="font-black text-xl tracking-tighter">CrowdGo</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-40">Event Code</p>
                <p className="font-bold">LFC-MC-26</p>
              </div>
            </div>

            {/* QR Mockup */}
            <div className="flex justify-center mb-12">
               <div className="w-48 h-48 border-[12px] border-black p-2 rounded-2xl relative overflow-hidden">
                  <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
                     {Array.from({ length: 16 }).map((_, i) => {
                       // Use deterministic pattern instead of Math.random() to avoid hydration mismatch
                       const isBlack = (i + Math.floor(i / 4)) % 3 !== 0;
                       return (
                         <div key={i} className={`rounded-sm ${isBlack ? 'bg-black' : 'bg-transparent'}`} />
                       );
                     })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center shadow-lg border border-black/5">
                      <Zap className="text-black" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Seat Info Grid */}
            <div className="grid grid-cols-2 gap-y-8 border-t border-black/10 pt-10">
              <div>
                <p className="text-[10px] font-black uppercase opacity-40">Gate</p>
                <p className="text-4xl font-black">{userTicket.gate}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-40">Section</p>
                <p className="text-4xl font-black">{userTicket.section}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40">Row</p>
                <p className="text-4xl font-black">{userTicket.row}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-40">Seat</p>
                <p className="text-4xl font-black">{userTicket.seat}</p>
              </div>
            </div>
            
            <div className="mt-12 py-4 border-t border-dashed border-black/20 flex items-center justify-between">
               <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Scan at entrance</span>
               <ShieldCheck className="text-black/20" />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 w-full">
           <button className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors">
              <Download size={24} className="text-primary" />
              <span className="text-[10px] font-black uppercase">Add to Wallet</span>
           </button>
           <button className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors">
              <Share2 size={24} className="text-secondary" />
              <span className="text-[10px] font-black uppercase">Share Ticket</span>
           </button>
        </div>

        <button className="w-full mt-8 py-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-4 group hover:border-primary/50 transition-all">
           <Navigation className="text-primary" />
           <span className="font-black uppercase tracking-widest text-sm">Take Me Back to Seat {userTicket.row}{userTicket.seat}</span>
           <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>
      </main>
    </div>
  );
}
