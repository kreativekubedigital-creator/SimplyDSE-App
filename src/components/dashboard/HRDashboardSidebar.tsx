'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  ShieldCheck, 
  GitBranch, 
  Bell, 
  Settings,
  Plus,
  Send,
  FileText,
  Download,
  FileBarChart,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

const navSections = [
  {
    title: 'Organization Platform',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Employee Management', href: '/employees', icon: Users },
      { name: 'Risk & Compliance', href: '/compliance', icon: ShieldCheck },
      { name: 'Operations Center', href: '/workflows', icon: GitBranch },
      { name: 'Communications', href: '/communications', icon: Bell },
      { name: 'Platform Settings', href: '/settings', icon: Settings },
    ]
  }
];

const quickActions = [
  { name: 'Create Assessment', icon: Plus },
  { name: 'Send Reminder', icon: Send },
  { name: 'Generate Report', icon: FileText },
  { name: 'Export Compliance Data', icon: Download },
];

export function HRDashboardSidebar() {
  const pathname = usePathname();
  const { organizationName, organizationLogoUrl, loading } = useProfile();

  return (
    <aside className="w-[260px] bg-[#0F172A] text-slate-300 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Organisation Brand Section */}
      <div className="p-5 pb-6 border-b border-slate-800/50 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/50 overflow-hidden shrink-0">
            {organizationLogoUrl ? (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <img src={organizationLogoUrl} alt={organizationName || ''} className="w-full h-full object-contain p-1.5" />
              </div>
            ) : (
              <div className="w-full h-full bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-bold text-xs uppercase">
                {loading ? '...' : (organizationName ? organizationName.substring(0, 2) : 'OW')}
              </div>
            )}
          </div>
          <div className="text-left min-w-0">
            <h1 className="text-[14px] font-bold text-white leading-tight truncate">
              {loading ? 'Loading...' : (organizationName || 'Organisation Workspace')}
            </h1>
            <div className="mt-1 space-y-0.5">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">Organisation Workspace</p>
              <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider leading-none">HR Workspace</p>
            </div>
          </div>
        </div>
      </div>


      {/* Navigation items - Reduced vertical padding and font size */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar py-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = item.href === '/' 
                ? pathname === '/' || pathname === ''
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                      : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isActive ? "text-white" : "text-slate-300 group-hover:text-slate-200"
                  )} />
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Active Indicator Pillar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Branding & Actions */}
      <div className="mt-auto">
        {/* Quick Actions Footer Card */}
        <div className="p-3">
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3">
            <p className="text-[9px] font-semibold text-slate-200 uppercase tracking-widest mb-2 px-1 text-center">Quick Actions</p>
            <div className="grid grid-cols-1 gap-0.5">
              {quickActions.map((action) => (
                <button 
                  key={action.name}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-700/50 transition-all group text-left"
                >
                  <action.icon className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="px-3 pb-2">
          <button 
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase');
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 transition-all text-left group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[12px] font-semibold">Sign Out</span>
          </button>
        </div>

        {/* Powered by SimplyDSE */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[11px] font-bold text-white tracking-tight leading-none">Powered by SimplyDSE</h1>
              <p className="text-[8px] text-slate-500 font-bold mt-1 uppercase tracking-tighter truncate">Workplace Compliance Platform</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
