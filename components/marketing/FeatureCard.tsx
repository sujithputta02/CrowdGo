"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  tag: string;
}

export function FeatureCard({ icon, title, desc, tag }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card p-10 flex flex-col items-start gap-8 relative group cursor-default"
    >
      <div className="absolute top-6 right-8 text-[10px] font-black text-text-muted tracking-[0.2em] group-hover:text-primary transition-colors">
        [{tag}]
      </div>
      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black mb-4 font-heading">{title}</h3>
        <p className="text-text-muted leading-relaxed">{desc}</p>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-secondary" 
        />
      </div>
    </motion.div>
  );
}
