'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Search, Bell, HelpCircle, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useProfile } from '@/hooks/useProfile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { fullName, initials, roleLabel, loading } = useProfile();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: Persistent | Mobile: Drawer */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-[70] w-64 bg-[#0F172A] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <AdminSidebar />
          
          {/* Close Button (Mobile Only) */}
          <button 
            className="absolute top-6 -right-12 p-2 bg-white rounded-xl shadow-xl lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen relative">
          {/* Top Header */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
            <div className="flex items-center gap-4 md:gap-8 flex-1">
              <button 
                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button className="hidden lg:block p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative w-full max-w-2xl hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search system..."
                  className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-12 pr-12 py-2.5 text-[14px] focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 pl-4">
              <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Systems OK</span>
              </div>

              <div className="flex items-center gap-1 md:gap-3">
                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-danger text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white group-hover:scale-110 transition-transform">
                    12
                  </span>
                </button>
                <button className="hidden sm:flex p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

              <button className="flex items-center gap-3 md:gap-4 pl-3 pr-1.5 py-1.5 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-900 leading-none">
                    {loading ? 'Loading...' : fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest font-bold">
                    {loading ? '...' : roleLabel}
                  </p>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md transition-all flex items-center justify-center font-bold text-slate-600">
                  {loading ? '...' : initials}
                </div>
              </button>
            </div>
          </header>

        {/* Main Content Area - Stretches to full width */}
        <main className="flex-1 p-4 md:p-10 w-full overflow-y-auto overflow-x-hidden">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
