"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  color: 'primary' | 'secondary' | 'accent' | 'white';
  onClick?: () => void;
  "aria-label"?: string;
}

export function ActionButton({ icon, label, color, onClick, "aria-label": ariaLabel }: ActionButtonProps) {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    white: 'text-white bg-white/5 border-white/10',
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-5 rounded-2xl border flex items-center md:justify-start justify-center gap-4 transition-all hover:bg-white/10 ${colorMap[color]} w-full`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}
