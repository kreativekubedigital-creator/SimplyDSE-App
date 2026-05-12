'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown
} from 'lucide-react';

export function DashboardNavbar() {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search employees, assessments, departments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-16 py-3 text-[13px] font-medium placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400">⌘</span>
            <span className="text-[10px] font-bold text-slate-400">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white leading-none">8</span>
            </div>
          </button>
          <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <button className="flex items-center gap-3 pl-2 group">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            SJ
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">Sarah Johnson</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">HR Manager</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-1" />
        </button>
      </div>
    </header>
  );
}
