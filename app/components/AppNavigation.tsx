"use client";

import React from 'react';
import { Home, Map, Utensils, Ticket, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Home', href: '/main' },
  { icon: Map, label: 'Map', href: '/map' },
  { icon: Utensils, label: 'Services', href: '/services' },
  { icon: Ticket, label: 'Ticket', href: '/ticket' },
  { icon: User, label: 'Me', href: '/profile' },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-background/80 backdrop-blur-2xl border-t border-white/5">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary scale-110' : 'text-text-muted hover:text-white'}`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-background border-r border-white/5 z-50 p-6">
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <Zap className="text-white w-5 h-5" fill="currentColor" />
        </div>
        <span className="text-xl font-black tracking-tighter">Crowd<span className="gradient-text">Go</span></span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
          <Link 
            href="/admin/simulation"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/admin/simulation' ? 'text-accent font-bold' : 'text-text-muted hover:text-white'}`}
          >
            <Zap size={20} className="text-accent" />
            <span className="text-sm tracking-wide">Stadium Pulse</span>
          </Link>
        </div>
      </nav>

      <div className="pt-6 border-t border-white/5 mt-auto">
        <div className="p-4 rounded-2xl glass-card border-white/5">
          <p className="text-[10px] font-black uppercase text-text-muted mb-2 tracking-widest leading-none">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold uppercase">Live @ Wankhede</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
