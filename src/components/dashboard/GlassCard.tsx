import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
  accent?: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'purple' | 'slate';
}

export function GlassCard({ 
  children, 
  className, 
  gradient = false, 
  hover = true,
  accent
}: GlassCardProps) {
  const accentGradients = {
    blue: "from-blue-500/5 to-transparent",
    emerald: "from-emerald-500/5 to-transparent",
    rose: "from-rose-500/5 to-transparent",
    amber: "from-amber-500/5 to-transparent",
    indigo: "from-indigo-500/5 to-transparent",
    purple: "from-purple-500/5 to-transparent",
    slate: "from-slate-500/5 to-transparent",
  };

  return (
    <div className={cn(
      "bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm transition-all duration-500 relative overflow-hidden group",
      hover && "hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200/50",
      className
    )}>
      {/* Dynamic Background Gradient */}
      {gradient && (
        <div className={cn(
          "absolute -inset-px bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity -z-10",
          accent ? accentGradients[accent] : "from-blue-500/5 to-transparent"
        )} />
      )}
      
      {/* Decorative Blur Dot */}
      {accent && (
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-20 transition-opacity duration-700 -z-10",
          accent === 'blue' && "bg-blue-500",
          accent === 'emerald' && "bg-emerald-500",
          accent === 'rose' && "bg-rose-500",
          accent === 'amber' && "bg-amber-500",
          accent === 'indigo' && "bg-indigo-500",
          accent === 'purple' && "bg-purple-500",
          accent === 'slate' && "bg-slate-500",
        )} />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
