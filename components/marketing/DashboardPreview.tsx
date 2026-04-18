"use client";

import { Eye, BarChart3 } from 'lucide-react';

export function DashboardPreview() {
  return (
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
                <p className="text-sm text-text-muted italic">Detect bottlenecks before they turn into L&apos;s.</p>
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
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>
      </div>
    </section>
  );
}
