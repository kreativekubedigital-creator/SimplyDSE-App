'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Shield, 
  CreditCard, 
  FileText, 
  Settings,
  Bell,
  Activity,
  History,
  Workflow,
  PlusCircle,
  UserPlus,
  Megaphone,
  Ticket,
  LogOut,
  ChevronDown,
  Tag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useProfile } from '@/hooks/useProfile';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', section: 'Platform' },
  
  { name: 'Organisations', icon: Building2, href: '/admin/organizations', section: 'Management' },
  { name: 'Identity & Access', icon: Users, href: '/admin/users', section: 'Management' },
  
  { name: 'Intelligence', icon: BarChart3, href: '/admin/analytics', section: 'Intelligence' },
  
  { name: 'Assessment Management', icon: Shield, href: '/admin/compliance', section: 'Security' },
  { name: 'Audit Logs', icon: History, href: '/admin/audit', section: 'Security' },
  
  { name: 'Operations Center', icon: Workflow, href: '/admin/workflows', section: 'Operations' },
  
  { name: 'Billing', icon: CreditCard, href: '/admin/billing', section: 'Configuration' },
  { name: 'Price Management', icon: Tag, href: '/admin/pricing', section: 'Configuration' },
  { name: 'Settings', icon: Settings, href: '/admin/settings', section: 'Configuration' },
];

const shortcuts = [
  { name: 'Provision Workspace', icon: PlusCircle, href: '/admin/organizations/new' },
  { name: 'System Alerts', icon: Bell, href: '/admin/notifications' },
  { name: 'Support Center', icon: Ticket, href: '/admin/tickets' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { fullName, email, loading, initials } = useProfile();

  return (
    <aside className="w-64 h-screen bg-[#0F172A] border-r border-slate-800 flex flex-col sticky top-0 text-slate-400">
      {/* Logo Section */}
      <div className="p-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-white tracking-tight leading-none">SimplyDSE</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar scrollbar-hide pb-10">
        {['Platform', 'Management', 'Intelligence', 'Security', 'Operations', 'Configuration'].map((section) => {
          const sectionItems = navigation.filter(item => item.section === section);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={section} className="space-y-1">
              <div className="px-3 mb-2">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{section}</h3>
              </div>
              {sectionItems.map((item) => {
                const isActive = item.href === '/admin' 
                  ? pathname === '/admin' || pathname === '/admin/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                      isActive 
                        ? 'bg-brand-primary text-white font-semibold shadow-lg shadow-brand-primary/20' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 transition-colors duration-200", isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                    <span className="text-[12px] relative z-10">{item.name}</span>
                    
                    {/* Active Indicator Pillar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* Shortcuts Section */}
        <div className="mt-8 mb-2 px-3">
          <h3 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Shortcuts</h3>
        </div>
        {shortcuts.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200 group"
          >
            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="text-[12px]">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800 bg-[#0F172A] space-y-1">
        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all text-left">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white overflow-hidden text-[10px] font-bold">
            {loading ? '...' : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{loading ? 'Loading...' : fullName}</p>
            <p className="text-[9px] text-slate-400 truncate">{loading ? '...' : email}</p>
          </div>
        </button>
        
        <button 
          onClick={async () => {
            const { supabase } = await import('@/lib/supabase');
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 p-2 rounded-xl text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-400/10 group-hover:bg-rose-400/20 transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-[12px] font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
