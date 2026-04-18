"use client";

import { Navigation, Zap, Utensils, MapPin } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  return (
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
  );
}
