"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useServices } from '@/lib/hooks/use-services';
import { ServiceListItem } from '@/components/dashboard/ServiceListItem';

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { services, isLoading } = useServices(filter);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setFilter(f);
  }, [searchParams]);

  const displayedServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32 md:pb-12 pt-8">
      <main className="container mx-auto px-6 max-w-4xl">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black mb-4 font-heading tracking-tighter uppercase">Arena Services</h1>
          <p className="text-text-muted text-lg">Real-time W-rankings of every hub in the venue. Check the wait, hit the flow.</p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search food, drinks, or gates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-text-muted/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['all', 'food', 'restroom', 'drink'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  router.push(`/services?filter=${f}`, { scroll: false });
                }}
                className={`px-6 py-4 rounded-2xl border font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap ${filter === f ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <p className="text-text-muted uppercase font-black tracking-widest text-xs">Scanning Hubs...</p>
            </div>
          ) : displayedServices.length > 0 ? (
            displayedServices.map((service, index) => (
              <ServiceListItem 
                key={service.id} 
                service={service} 
                index={index} 
                onClick={() => router.push(`/map?serviceId=${service.id}`)}
              />
            ))
          ) : (
            <div className="py-20 text-center glass-card border-white/5 rounded-3xl">
              <p className="text-text-muted italic">No services found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
