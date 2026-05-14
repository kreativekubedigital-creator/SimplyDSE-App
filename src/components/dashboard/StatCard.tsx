import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  trend, 
  isPositive = true, 
  icon: Icon, 
  iconColor = "blue",
  className 
}: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className={cn(
      "bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 group cursor-default",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
          colorMap[iconColor] || colorMap.blue
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border",
            isPositive 
              ? "bg-emerald-50/50 text-emerald-600 border-emerald-100/50" 
              : "bg-rose-50/50 text-rose-600 border-rose-100/50"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em]">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
      </div>
      
      {/* Subtle background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] -z-10" />
    </div>
  );
}
