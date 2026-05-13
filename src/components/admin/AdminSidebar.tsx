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
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, href: '/' },
  { name: 'Organisations', icon: Building2, href: '/organizations' },
  { name: 'Users', icon: Users, href: '/users' },
  { name: 'Roles & Permissions', icon: ShieldCheck, href: '/roles' },
  { name: 'Reports', icon: BarChart3, href: '/analytics' },
  { name: 'Compliance', icon: Shield, href: '/compliance' },
  { name: 'Security', icon: ShieldCheck, href: '/security' },
  { name: 'Billing', icon: CreditCard, href: '/billing' },
  { name: 'Workflows', icon: Workflow, href: '/workflows' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
  { name: 'System Health', icon: Activity, href: '/health' },
  { name: 'Activity', icon: History, href: '/audit' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

const shortcuts = [
  { name: 'Create Organisation', icon: PlusCircle, href: '/organizations/new' },
  { name: 'Add User', icon: UserPlus, href: '/users/new' },
  { name: 'System Announcements', icon: Megaphone, href: '/announcements' },
  { name: 'Support Tickets', icon: Ticket, href: '/tickets' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; full_name: string } | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', authUser.id)
            .single();
          
          if (profile) {
            setUser(profile);
          } else {
            setUser({ email: authUser.email || '', full_name: 'Platform Admin' });
          }
        }
      } catch (err) {
        console.error('Error in AdminSidebar profile fetch:', err);
      }
    }
    getProfile();
  }, []);

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
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar scrollbar-hide">
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? 'bg-brand-primary text-white font-semibold shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
              <span className="text-[12px]">{item.name}</span>
            </Link>
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

      <div className="p-3 border-t border-slate-800 bg-[#0F172A]">
        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all text-left">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white overflow-hidden">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Super Admin')}&background=1E40AF&color=fff`} 
              alt={user?.full_name || "Super Admin"} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{user?.full_name || 'Super Admin'}</p>
            <p className="text-[9px] text-slate-400 truncate">{user?.email || 'superadmin@simplydse.com'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </aside>
  );
}
