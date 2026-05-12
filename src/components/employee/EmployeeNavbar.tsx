'use client';

import React from 'react';
import { 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Search,
  Zap
} from 'lucide-react';

export function EmployeeNavbar() {
  return (
    <header className="h-[80px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-40">
      {/* Welcome Message */}
      <div className="flex flex-col">
        <h2 className="text-[20px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Welcome back, Olivia 👋
        </h2>
        <p className="text-[13px] text-slate-500 font-medium">Here's an overview of your assessments and workplace health.</p>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-8">
        {/* Support Link */}
        <button className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[13px] font-bold hover:bg-blue-600 hover:text-white transition-all group">
          <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
          Quick Assessment
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-[8px] font-bold text-white leading-none">3</span>
            </div>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200/60" />

        <button className="flex items-center gap-3 group">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-600 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[13px] font-bold text-slate-900 leading-none">Olivia Bennett</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Marketing Specialist</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-1" />
        </button>
      </div>
    </header>
  );
}
