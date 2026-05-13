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
  ChevronDown,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
  { name: 'Wellness Hub', href: '/employee/wellness', icon: ShieldCheck },
  { name: 'Communication', href: '/employee/communication', icon: MessageCircle, badge: '5' },
  { name: 'My Profile', href: '/employee/profile', icon: User },
];

export function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Brand */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-white tracking-tight leading-none">SimplyDSE</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Employee Portal</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                )} />
                {item.name}
              </div>
              {item.badge && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Org */}
      <div className="p-4 space-y-2 border-t border-slate-800/50">
        {/* User */}
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" 
                alt="" 
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-800 group-hover:border-blue-600 transition-colors"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[12px] font-semibold text-white leading-none truncate">Olivia Bennett</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">Marketing Specialist</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        </button>

        {/* Organisation */}
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/50 group-hover:bg-slate-700 transition-colors">
              <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[12px] font-semibold text-white leading-none truncate">Acme Corporation</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">acme.simplydse.com</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        </button>
      </div>
    </aside>
  );
}
