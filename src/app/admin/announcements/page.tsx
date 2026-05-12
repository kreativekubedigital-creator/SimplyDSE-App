'use client';

import React from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  Calendar, 
  Globe, 
  Users, 
  Zap, 
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
  Mail,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';

const announcements = [
  { id: 1, title: 'Scheduled Platform Maintenance - May 20', target: 'All Workspaces', status: 'Scheduled', reach: '100%', date: 'May 20, 2026' },
  { id: 2, title: 'New Security Features: Biometric MFA', target: 'Enterprise', status: 'Sent', reach: '98%', date: 'May 10, 2026' },
  { id: 3, title: 'Critical Bug Fix: Report Generation', target: 'All Workspaces', status: 'Sent', reach: '100%', date: 'May 08, 2026' },
  { id: 4, title: 'Upcoming Webinar: Compliance 101', target: 'EU Region', status: 'Draft', reach: '0%', date: 'N/A' },
];

export default function SystemAnnouncementsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Announcements</h1>
            <p className="text-[13px] text-slate-500">Dispatch global broadcasts and targeted system updates to your Workspace fleet.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            Create Global Broadcast
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Sent" 
            value="142" 
            change="+12 this month" 
            trend="up" 
            icon={Megaphone} 
          />
          <StatCard 
            label="Average Reach" 
            value="99.4%" 
            change="+0.2%" 
            trend="up" 
            icon={Globe} 
          />
          <StatCard 
            label="Active Alerts" 
            value="01" 
            change="Critical" 
            trend="neutral" 
            icon={Zap} 
          />
          <StatCard 
            label="Opt-out Rate" 
            value="1.2%" 
            change="Minimal" 
            trend="up" 
            icon={Users} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Announcement Feed */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-[18px] font-bold text-slate-900">Broadcast History</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter announcements..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {announcements.map((item) => (
                <div key={item.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                        item.status === 'Sent' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        item.status === 'Scheduled' ? "bg-blue-50 border-blue-100 text-blue-600" :
                        "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[15px]">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.target}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[11px] text-slate-400 font-medium">Reach: {item.reach}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-[12px] font-bold text-slate-900">{item.date}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.status}</p>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <h3 className="text-[18px] font-bold">Smart Routing</h3>
              <p className="text-white/50 text-[13px] leading-relaxed">Automate announcement delivery based on Workspace region, plan, or user activity.</p>
              
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email Digest', enabled: true },
                  { icon: Bell, label: 'In-App Toast', enabled: true },
                  { icon: Zap, label: 'SMS Emergency', enabled: false },
                ].map((channel, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <channel.icon className="w-5 h-5 text-brand-light" />
                      <span className="text-[13px] font-bold">{channel.label}</span>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", channel.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20")} />
                  </div>
                ))}
              </div>
              
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold rounded-2xl border border-white/20 transition-all">
                Configure Global Templates
              </button>
            </div>

            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] p-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-[14px] font-bold text-slate-900">Audience Segmentation</p>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                Targeted announcements ensure relevant communication and higher engagement rates across different Workspace types.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
