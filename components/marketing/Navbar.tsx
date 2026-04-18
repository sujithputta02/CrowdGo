"use client";

import { Zap } from 'lucide-react';

interface NavbarProps {
  isScrolled: boolean;
}

export function Navbar({ isScrolled }: NavbarProps) {
  return (
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
  );
}
