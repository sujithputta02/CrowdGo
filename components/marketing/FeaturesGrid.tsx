import { Navigation, Coffee, ShieldCheck } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeaturesGrid() {
  return (
    <section id="features" className="py-32 px-6 z-10 relative">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 font-heading">THE PLAYBOOK FOR <span className="gradient-text">W FLOW.</span></h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            We tracked the crowd so you don&apos;t have to. Maximize your stadium aura with real-time intelligence.
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
  );
}
