import { Zap, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-40 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="container mx-auto">
        <h2 className="text-5xl md:text-7xl font-black mb-12 font-heading tracking-tighter">UPGRADE TO <span className="gradient-text">W VIBES.</span></h2>
        <p className="text-text-muted mb-16 max-w-xl mx-auto text-xl">
          Don&apos;t let L lines ruin your match day. Join the next generation of smart stadium movement.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button className="px-12 py-6 bg-white text-black rounded-3xl font-black text-xl hover:scale-105 transition-transform flex items-center justify-center gap-4">
            Download App
            <ArrowRight className="w-6 h-6" />
          </button>
          <button className="px-12 py-6 glass-card rounded-3xl font-black text-xl hover:bg-white/10 transition-colors">
            Request Info
          </button>
        </div>
        <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-5 h-5" fill="currentColor" />
            <span className="text-xl font-extrabold tracking-tighter">CrowdGo</span>
          </div>
          <div className="flex gap-10 text-sm text-text-muted font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Insta</a>
            <a href="#" className="hover:text-white transition-colors">X (fka Twitter)</a>
          </div>
          <p className="text-text-muted text-xs">© 2026 CrowdGo. No Cap. No Waiting.</p>
        </div>
      </div>
    </footer>
  );
}
