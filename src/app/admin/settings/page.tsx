'use client';

import React from 'react';
import { 
  Settings, 
  Globe, 
  Shield, 
  Database, 
  Server, 
  Key, 
  Mail, 
  Bell, 
  Activity,
  ChevronRight,
  Save,
  RotateCcw,
  Cloud,
  Lock,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Platform Control</h1>
            <p className="text-[13px] text-slate-500 mt-1">Configure root-level infrastructure, security protocols, and system-wide defaults.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              <RotateCcw className="w-4 h-4 inline-block mr-2" />
              Reset to Defaults
            </button>
            <button className="px-8 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              <Save className="w-4 h-4 inline-block mr-2" />
              Commit Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { label: 'General System', icon: Settings, active: true },
              { label: 'Cloud Infrastructure', icon: Cloud, active: false },
              { label: 'Security & IAM', icon: Lock, active: false },
              { label: 'Data Management', icon: Database, active: false },
              { label: 'Compliance Policy', icon: Shield, active: false },
              { label: 'Communication', icon: Mail, active: false },
              { label: 'API & Integrations', icon: Activity, active: false },
            ].map((item, i) => (
              <button 
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all",
                  item.active ? "bg-white text-brand-primary shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Settings Panel */}
          <div className="lg:col-span-9 space-y-10">
            {/* Platform Branding */}
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Platform Identity</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Manage global branding and public appearance.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Platform Name</label>
                  <input type="text" defaultValue="SimplyDSE" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Global Support Email</label>
                  <input type="email" defaultValue="support@simplydse.com" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
              </div>
            </section>

            {/* Infrastructure Settings */}
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Resource Provisioning</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Automatic infrastructure allocation rules for new tenants.</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Auto-Provision S3 Buckets', desc: 'Automatically create isolated storage for new orgs', enabled: true },
                  { label: 'Subdomain Isolation', desc: 'Enforce tenant-specific entry points (*.simplydse.com)', enabled: true },
                  { label: 'Multi-Region Replication', desc: 'Replicate data across EU and US nodes by default', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 group">
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">{item.label}</p>
                      <p className="text-[12px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <button className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      item.enabled ? "bg-brand-primary" : "bg-slate-200"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        item.enabled ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 space-y-8">
              <div className="flex items-center gap-4 text-red-600">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold">Maintenance & Recovery</h3>
                  <p className="text-[13px] text-red-900/50 mt-1">Irreversible platform actions and system resets.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all">
                  Purge Stale Logs
                </button>
                <button className="w-full sm:w-auto px-8 py-3 bg-white border border-red-200 text-red-600 text-[12px] font-bold rounded-xl hover:bg-red-50 transition-all">
                  Trigger System Rebuild
                </button>
              </div>
            </section>
          </div>
        </div>
    </div>
  );
}
