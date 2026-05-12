'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  subValue?: string;
}

export function StatCard({ label, value, change, trend, icon: Icon, subValue }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all group flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-all shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest leading-tight mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{value}</h3>
          {change && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-semibold",
              trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-rose-600" : "text-slate-600"
            )}>
              {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : trend === 'down' ? <TrendingDown className="w-2.5 h-2.5" /> : null}
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
