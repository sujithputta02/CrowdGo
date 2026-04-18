export function StatsSection() {
  return (
    <section className="py-20 bg-white/5 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-5xl font-black gradient-text mb-2">94%</p>
            <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Wait Time Reduction</p>
          </div>
          <div>
            <p className="text-5xl font-black gradient-text mb-2">2.5k</p>
            <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Avg Stats Saved</p>
          </div>
          <div>
            <p className="text-5xl font-black gradient-text mb-2">Zero</p>
            <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Missed Match Moments</p>
          </div>
          <div>
            <p className="text-5xl font-black gradient-text mb-2">10/10</p>
            <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Vibe Score</p>
          </div>
        </div>
      </div>
    </section>
  );
}
