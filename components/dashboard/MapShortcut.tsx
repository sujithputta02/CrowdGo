"use client";

import { ReactNode } from 'react';

interface MapShortcutProps {
  label: string;
  time: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function MapShortcut({ label, time, icon, onClick }: MapShortcutProps) {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-4 flex items-center justify-between border-white/5 hover:border-primary/30 transition-all text-left group active:scale-95"
    >
       <div className="flex items-center gap-3">
          <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
       </div>
       <span className="text-[10px] font-bold text-text-muted">{time}</span>
    </button>
  );
}
