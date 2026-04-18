"use client";

import { Contrast } from 'lucide-react';
import { useHighContrast } from '@/lib/contexts/HighContrastContext';

export default function HighContrastToggle() {
  const { highContrast, toggleHighContrast } = useHighContrast();

  return (
    <button
      onClick={toggleHighContrast}
      className="fixed top-4 right-4 z-50 p-3 bg-surface border border-border rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
      aria-pressed={highContrast}
      title={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      <Contrast 
        size={20} 
        className={highContrast ? 'text-primary' : 'text-text-muted'}
        aria-hidden="true"
      />
    </button>
  );
}
