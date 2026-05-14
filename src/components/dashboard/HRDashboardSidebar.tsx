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
  ChevronDown,
  Building2,
  FileBarChart,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

const navSections = [
  {
    title: 'Platform',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Workforce Hub', href: '/dashboard/employees', icon: Users },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Risk & Compliance', href: '/dashboard/compliance', icon: ShieldCheck },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Operations Center', href: '/dashboard/workflows', icon: GitBranch },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { name: 'Communications', href: '/dashboard/communications', icon: Bell },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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

  const orgName = loading ? 'Loading...' : (organizationName || 'Your Organisation');

  return (
    <aside className="w-[260px] bg-[#0F172A] text-slate-300 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Brand Section - SimplyDSE Platform Logo */}
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-white/5 border border-slate-800">
            <img src="/simplydselogo.webp" alt="SimplyDSE" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold text-white tracking-tight leading-none">SimplyDSE</h1>
            <p className="text-[10px] text-slate-200 font-medium mt-1">Workplace Compliance</p>
          </div>
        </div>
      </div>

      {/* Organisation Selector - Shows org logo */}
      <div className="px-4 mb-4">
        <button className="w-full flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all group">
          <div className="flex items-center gap-2.5">
            {organizationLogoUrl ? (
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center overflow-hidden border border-slate-600">
                <img src={organizationLogoUrl} alt={orgName} className="w-full h-full object-contain p-0.5" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-md bg-slate-700 flex items-center justify-center text-slate-200 group-hover:text-white transition-colors">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[12px] font-semibold text-white group-hover:text-white transition-colors">{orgName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-200 group-hover:text-white transition-all" />
        </button>
      </div>

      {/* Navigation items - Reduced vertical padding and font size */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar py-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
              {section.title}
            </p>
            {section.items.map((item) => {
              // Robust matching logic:
              // 1. Exact match for the current href
              // 2. For non-root paths, match if the pathname starts with the href followed by a slash (nested routes)
              // 3. Special case for /dashboard to ensure it doesn't over-match sub-modules
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' || pathname === '/dashboard/'
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

      {/* Quick Actions Footer Card - Slimmer profile */}
      <div className="p-3 mt-auto border-t border-slate-800/50">
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3">
          <p className="text-[9px] font-semibold text-slate-200 uppercase tracking-widest mb-2 px-1">Quick Actions</p>
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
    </aside>
  );
}
