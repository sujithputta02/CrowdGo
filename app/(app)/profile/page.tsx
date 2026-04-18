"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Accessibility, 
  Globe, 
  ChevronRight, 
  LogOut,
  ShieldAlert,
  Zap,
  Check
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { updateUserSetting } from '@/lib/db';
import { MOCK_VENUE_STATE } from '@/lib/mock-data';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { userTicket } = MOCK_VENUE_STATE;

  const toggleSetting = async (key: 'stepFree' | 'highContrast') => {
    if (!user || !profile) return;
    const newValue = !profile.settings.accessibility[key];
    await updateUserSetting(user.uid, `settings.accessibility.${key}`, newValue);
  };

  const toggleNotifications = async () => {
    if (!user || !profile) return;
    const newValue = !profile.settings.notifications;
    await updateUserSetting(user.uid, 'settings.notifications', newValue);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-12 pt-8">
      <main id="main-content" className="container mx-auto px-6 max-w-2xl">
        <header className="mb-12 flex items-center gap-8">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary p-1">
             <div className="w-full h-full bg-background rounded-[28px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <User size={40} className="text-primary relative z-10" />
             </div>
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tighter uppercase leading-none mb-2">
              {profile?.displayName || user?.email?.split('@')[0] || 'Fan Account'}
            </h1>
            <p className="text-text-muted flex items-center gap-2">
               <Zap size={14} className="text-secondary" />
               Section {profile?.ticket?.section || userTicket.section} • Locked In
            </p>
          </div>
        </header>

        {/* Global Stats */}
        <section className="grid grid-cols-2 gap-4 mb-12">
           <div className="glass-card p-6 border-white/5">
              <p className="text-[10px] font-black uppercase text-text-muted mb-1">Match Streak</p>
              <p className="text-2xl font-black italic">{profile?.matchStreak || 0} GAMES</p>
           </div>
           <div className="glass-card p-6 border-white/5">
              <p className="text-[10px] font-black uppercase text-text-muted mb-1">Aura Level</p>
              <p className="text-2xl font-black italic text-primary">{profile?.aura || 100}%</p>
           </div>
        </section>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Experience Settings */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50 px-2">Vibe Control</h2>
            <div className="glass-card border-white/5 overflow-hidden">
               <SettingItem 
                 icon={<Bell size={20} />} 
                 label="Smart Pings" 
                 desc="Real-time reroute alerts"
                 toggle={profile?.settings.notifications}
                 onToggle={toggleNotifications}
               />
               <SettingItem 
                 icon={<Accessibility size={20} />} 
                 label="Step-free Pathing" 
                 desc="Optimize for accessible routes"
                 toggle={profile?.settings.accessibility.stepFree}
                 onToggle={() => toggleSetting('stepFree')}
               />
               <SettingItem 
                 icon={<Globe size={20} />} 
                 label="Language" 
                 desc="English"
                 hasArrow
               />
            </div>
          </section>

          {/* Account Settings */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50 px-2">Account</h2>
            <div className="glass-card border-white/5 overflow-hidden">
               <SettingItem 
                 icon={<ShieldAlert size={20} />} 
                 label="Privacy & Aura" 
                 hasArrow
               />
               <SettingItem 
                 icon={<Settings size={20} />} 
                 label="App Settings" 
                 hasArrow
               />
               <button 
                 onClick={handleLogout}
                 className="w-full p-5 flex items-center gap-4 text-accent hover:bg-white/5 transition-colors cursor-pointer text-left"
                 aria-label="Sign out of your account"
               >
                  <LogOut size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">Sign Out</span>
               </button>
            </div>
          </section>
        </div>

        <p className="mt-12 text-center text-[10px] font-black uppercase text-text-muted tracking-[0.3em]">
          CrowdGo Version 1.1.0 // NO CAP
        </p>
      </main>
    </div>
  );
}

function SettingItem({ icon, label, desc, toggle, onToggle, hasArrow }: { 
  icon: any, 
  label: string, 
  desc?: string, 
  toggle?: boolean, 
  onToggle?: () => void,
  hasArrow?: boolean
}) {
  return (
    <button 
      className="w-full p-5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group text-left"
      onClick={onToggle}
      disabled={!onToggle}
      aria-label={`${label}${desc ? `: ${desc}` : ''}${toggle !== undefined ? ` - Currently ${toggle ? 'enabled' : 'disabled'}` : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{label}</p>
          {desc && <p className="text-xs text-text-muted italic">{desc}</p>}
        </div>
      </div>
      
      {toggle !== undefined ? (
        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${toggle ? 'bg-primary' : 'bg-white/10'}`} aria-hidden="true">
          <motion.div 
            animate={{ x: toggle ? 24 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </div>
      ) : hasArrow ? (
        <ChevronRight size={16} className="text-text-muted group-hover:text-white transition-colors" aria-hidden="true" />
      ) : null}
    </button>
  );
}
