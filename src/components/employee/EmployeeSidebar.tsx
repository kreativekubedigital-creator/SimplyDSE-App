'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  LineChart, 
  Heart, 
  FileText, 
  MessageCircle, 
  Bell, 
  User, 
  HelpCircle,
  Building2,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

const navigation = [
  { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
  { name: 'Assessment Hub', href: '/employee/assessments', icon: ShieldCheck },
  { name: 'Communication', href: '/employee/communication', icon: MessageCircle, badge: '5' },
  { name: 'My Profile', href: '/employee/profile', icon: User },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const { fullName, initials, roleLabel, loading, organizationName, organizationLogoUrl } = useProfile();

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Organisation Brand */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/50 overflow-hidden shrink-0">
            {organizationLogoUrl ? (
              <img src={organizationLogoUrl} alt={organizationName || ''} className="w-full h-full object-contain p-1.5" />
            ) : (
              <div className="w-full h-full bg-blue-600/10 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
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
              <p className="text-[8px] text-blue-500 font-bold uppercase tracking-wider leading-none">Employee Workspace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = item.href === '/employee' 
            ? pathname === '/employee' || pathname === '/employee/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                )} />
                {item.name}
              </div>
              
              {/* Active Indicator Pillar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              )}

              {item.badge && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-bold relative z-10",
                  isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding & Logout */}
      <div className="mt-auto">
        {/* Sign Out Button */}
        <div className="px-4 pb-2">
          <button 
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase');
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 transition-all text-left group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[12px] font-semibold">Sign Out</span>
          </button>
        </div>

        {/* Powered by SimplyDSE */}
        <div className="p-4 border-t border-slate-800/50">
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
