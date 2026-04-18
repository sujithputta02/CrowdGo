interface IdentitySectionProps {
  gate: string;
  section: string;
}

export function IdentitySection({ gate, section }: IdentitySectionProps) {
  return (
    <section>
      <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">Identity</h2>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
         <div className="glass-card p-5 border-white/5">
            <p className="text-[10px] font-black uppercase text-text-muted mb-1">Gate</p>
            <p className="text-2xl font-black">{gate}</p>
         </div>
         <div className="glass-card p-5 border-white/5">
            <p className="text-[10px] font-black uppercase text-text-muted mb-1">Section</p>
            <p className="text-2xl font-black">{section}</p>
         </div>
      </div>
    </section>
  );
}
