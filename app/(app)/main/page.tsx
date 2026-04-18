"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { ArrivalService } from '@/lib/services/arrival.service';
import { useVenueState } from '@/lib/hooks/use-venue-state';

import { AppHeader } from '@/components/dashboard/AppHeader';
import { IdentitySection } from '@/components/dashboard/IdentitySection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SmartRecommendation } from '@/components/dashboard/SmartRecommendation';
import { MatchStats } from '@/components/dashboard/MatchStats';
import { LivePings } from '@/components/dashboard/LivePings';
import { ActionButton } from '@/components/dashboard/ActionButton';
import { Navigation, Zap, Utensils, MapPin } from 'lucide-react';

export default function AppPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { 
    prediction, 
    isThinking, 
    services, 
    notifications, 
    activeMatch 
  } = useVenueState();

  const userTicket = profile?.ticket || { section: '---', gate: '-', row: '-', seat: '-' };
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
      <AppHeader activeMatch={activeMatch} />

      <main id="main-content" className="container mx-auto px-6 py-6 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Ticket & Actions */}
          <div className="md:col-span-3 space-y-8">
            <IdentitySection gate={userTicket.gate} section={userTicket.section} />
            <QuickActions />
          </div>

          {/* CENTER COLUMN: Main Recommendation & Map */}
          <div className="md:col-span-6 space-y-8">
            <SmartRecommendation 
              isThinking={isThinking}
              service={services[0]}
              prediction={prediction}
              onNavigate={startNavigation}
            />

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
            <MatchStats activeMatch={activeMatch} arrival={arrival} />
            <LivePings notifications={notifications} />
          </div>

        </div>
      </main>
    </div>
  );
}
