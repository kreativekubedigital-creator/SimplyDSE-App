'use client';

import React from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Globe, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  HardDrive,
  Network
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const services = [
  { name: 'Identity Engine', status: 'Healthy', uptime: '99.99%', latency: '42ms', load: '12%', icon: Cpu },
  { name: 'PostgreSQL Cluster', status: 'Healthy', uptime: '100%', latency: '8ms', load: '24%', icon: Database },
  { name: 'Redis Edge Cache', status: 'Healthy', uptime: '99.98%', latency: '2ms', load: '8%', icon: Zap },
  { name: 'Worker Fleet (Node)', status: 'Active', uptime: '100%', latency: '4ms', load: '45%', icon: Activity },
  { name: 'Compliance Mailer', status: 'Healthy', uptime: '99.95%', latency: '124ms', load: '2%', icon: MessageSquare },
  { name: 'Static Edge (CDN)', status: 'Healthy', uptime: '100%', latency: '14ms', load: '5%', icon: Globe },
];

export function SystemHealth() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Platform Status Summary */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          <Activity className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Uptime Nominal</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest">All Systems Operational</span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
              Global infrastructure is operating at peak performance. No degradation detected across 12 active regions and 142 tenant clusters. 
              Last global integrity check completed <span className="text-slate-900 font-bold underline decoration-slate-200 underline-offset-4 cursor-help" title="2026-05-11 14:45:00 UTC">2 minutes ago</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-12 shrink-0 pr-8">
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Latency</p>
              <p className="text-2xl font-bold text-slate-900">24ms</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">0.001%</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Worker Load</p>
              <p className="text-2xl font-bold text-slate-900">18.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.name} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all duration-300">
                <service.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{service.status}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Load: {service.load}</p>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-900 text-base mb-6">{service.name}</h3>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SLO Uptime</p>
                <p className="text-sm font-bold text-slate-900">{service.uptime}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Response</p>
                <p className="text-sm font-bold text-slate-900">{service.latency}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <div className="flex gap-1.5">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="flex-1 h-8 bg-emerald-50/60 rounded-[4px] hover:bg-emerald-500 transition-colors cursor-help border border-emerald-100/30" title={`Status at ${24-i}h ago: 100% Healthy`}></div>
                ))}
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">24H History</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Nominal</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Background Jobs */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Server className="w-48 h-48" />
          </div>
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3 text-[14px] uppercase tracking-widest">
            <Clock className="w-4 h-4 text-brand-primary" />
            Infrastructure Jobs
          </h3>
          <div className="space-y-8">
            {[
              { label: 'Assessment Ingestion', count: '12,412', status: 'Healthy', progress: 100, color: 'bg-emerald-500' },
              { label: 'Tenant Provisioning Queue', count: '3', status: 'Active', progress: 65, color: 'bg-brand-primary' },
              { label: 'Global Data Sync', count: '142', status: 'Healthy', progress: 100, color: 'bg-emerald-500' },
              { label: 'Security Scan Cycle', count: 'Active', status: 'Processing', progress: 82, color: 'bg-amber-500' },
            ].map((job) => (
              <div key={job.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[12px] font-bold text-slate-900 block">{job.label}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{job.status}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{job.count}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={cn("h-full transition-all duration-1000 rounded-full", job.color)} 
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Event Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Network className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-3 text-[14px] uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4 text-brand-primary" />
              Live Security Stream
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
              <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.1em]">Live Tracking</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { type: 'SEC', msg: 'Elevated login failures detected from 182.4.x.x (Asia Pacific)', time: 'Just now', color: 'text-red-400' },
              { type: 'SYS', msg: 'Automated backup sequence for US-EAST-1 cluster finalized', time: '1m ago', color: 'text-emerald-400' },
              { type: 'AUTH', msg: 'Super Admin "j.wilson" initialized security override for Acme Corp', time: '4m ago', color: 'text-brand-primary' },
              { type: 'NET', msg: 'Global CDN edge nodes in EU-CENTRAL reporting 12ms latency', time: '12m ago', color: 'text-slate-400' },
              { type: 'SEC', msg: 'Suspicious payload blocked by WAF at edge node 042-LDN', time: '18m ago', color: 'text-red-400' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group">
                <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border h-fit mt-1", 
                  alert.type === 'SEC' ? 'border-red-500/30 text-red-400' :
                  alert.type === 'SYS' ? 'border-emerald-500/30 text-emerald-400' :
                  'border-brand-primary/30 text-brand-primary'
                )}>
                  {alert.type}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] leading-relaxed font-medium text-slate-300 group-hover:text-white transition-colors">{alert.msg}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{alert.time}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
          
          <button className="w-full mt-8 py-4 text-[11px] font-bold text-slate-400 hover:text-white border border-dashed border-slate-700 rounded-2xl transition-all uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10">
            Access Full Diagnostic Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
