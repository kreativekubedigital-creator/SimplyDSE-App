'use client';

import React from 'react';
import { 
  Bell, 
  Megaphone, 
  Settings, 
  Search, 
  Mail, 
  MessageSquare, 
  Zap,
  Globe,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';

const systemAnnouncements = [
  { id: 1, title: 'v2.4 Platform Migration', target: 'Global', status: 'Scheduled', priority: 'High', date: 'May 15, 2026' },
  { id: 2, title: 'Database Maintenance Window', target: 'EU-West-1', status: 'Active', priority: 'Critical', date: 'May 12, 2026' },
  { id: 3, title: 'New Compliance Module Launch', target: 'Enterprise', status: 'Draft', priority: 'Medium', date: 'N/A' },
  { id: 4, title: 'API Gateway Rate Limit Update', target: 'Pro Users', status: 'Sent', priority: 'Low', date: 'May 08, 2026' },
];

export default function PlatformNotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Broadcasts</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage global system announcements, automated notifications, and alert routing.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Active Broadcasts" 
            value="3" 
            change="Nominal" 
            trend="neutral" 
            icon={Megaphone} 
          />
          <StatCard 
            label="Reach Rate" 
            value="98.2%" 
            change="+2.4%" 
            trend="up" 
            icon={Globe} 
          />
          <StatCard 
            label="System Alerts" 
            value="142" 
            change="-12" 
            trend="up" 
            icon={Bell} 
          />
          <StatCard 
            label="Engage Rate" 
            value="42.5%" 
            change="+5%" 
            trend="up" 
            icon={Zap} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Feed */}
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-slate-900">Platform-Wide Announcements</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search broadcasts..."
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {systemAnnouncements.map((item) => (
                  <div key={item.id} className="p-8 hover:bg-slate-50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                          item.priority === 'Critical' ? "bg-red-50 border-red-100 text-red-600" :
                          item.priority === 'High' ? "bg-amber-50 border-amber-100 text-amber-600" :
                          "bg-blue-50 border-blue-100 text-blue-600"
                        )}>
                          <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[15px]">{item.title}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.target}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          item.status === 'Sent' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          item.status === 'Active' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {item.status}
                        </span>
                        <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Channels */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <h3 className="text-[18px] font-bold">Delivery Channels</h3>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email Broadcast', status: 'Active', active: true },
                  { icon: MessageSquare, label: 'In-App Alerts', status: 'Active', active: true },
                  { icon: Zap, label: 'Webhook Push', status: 'Paused', active: false },
                ].map((channel, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <channel.icon className="w-5 h-5 text-brand-light" />
                      <span className="text-[13px] font-bold">{channel.label}</span>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      channel.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20"
                    )} />
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold rounded-2xl border border-white/20 transition-all">
                Configure Routing Rules
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
              <h3 className="text-[16px] font-bold text-slate-900 mb-6">Subscription Trends</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex gap-1.5 h-16 items-end">
                    {[30, 60, 45, 90, 75, 50, 80].map((h, i) => (
                      <div key={i} className="w-2.5 bg-brand-primary/10 rounded-t-sm group relative">
                        <div className="absolute bottom-0 w-full bg-brand-primary rounded-t-sm transition-all duration-700" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] font-black text-slate-900">42%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
