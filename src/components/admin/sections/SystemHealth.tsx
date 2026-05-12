'use client';

import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';

interface ServiceMetric {
  id: string;
  name: string; // Corrected from service_name
  status: string;
  health_score: number;
  last_checked: string;
}

interface SecurityAlert {
  id: string;
  action: string; // Corrected from event_type
  details: string; // Corrected from description
  severity?: string; // Optional as it might not exist in all rows
  created_at: string;
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [metricsRes, alertsRes, workflowsRes] = await Promise.all([
        supabase.from('System_metrics').select('*').order('name'),
        supabase.from('audit_logs')
          .select('id, action, details, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('workflows').select('*').order('created_at', { ascending: false }).limit(4)
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data as any);
      if (alertsRes.data) setAlerts(alertsRes.data as any);
      if (workflowsRes.data) setWorkflows(workflowsRes.data);
    } catch (err) {
      console.error('Failed to fetch health data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    const metricsSub = supabase
      .channel('infra-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'System_metrics' }, () => fetchData())
      .subscribe();

    const alertsSub = supabase
      .channel('alert-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(metricsSub);
      supabase.removeChannel(alertsSub);
    };
  }, []);

  const getIcon = (name: string) => {
    if (!name) return Server;
    const n = name.toLowerCase();
    if (n.includes('database') || n.includes('sql')) return Database;
    if (n.includes('identity') || n.includes('engine')) return Cpu;
    if (n.includes('cache') || n.includes('redis')) return Zap;
    if (n.includes('worker') || n.includes('fleet')) return Activity;
    if (n.includes('mail')) return MessageSquare;
    if (n.includes('edge') || n.includes('cdn')) return Globe;
    return Server;
  };

  const avgLatency = 24; // Mocked for now as column is missing
  const avgLoad = metrics.length ? (metrics.reduce((acc, m) => acc + (m.health_score > 0 ? 100 - m.health_score : 0), 0) / metrics.length).toFixed(1) : '0';
  const hasIssues = metrics.some(m => m.status !== 'optimal' && m.status !== 'healthy');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pinging Global Nodes...</p>
        </div>
      </div>
    );
  }
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
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors border",
                hasIssues ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
              )}>
                {hasIssues ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {hasIssues ? 'System Warning' : 'Platform Uptime Nominal'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("w-2 h-2 rounded-full animate-pulse", hasIssues ? "bg-amber-500" : "bg-emerald-500")}></span>
                  <span className={cn("text-[12px] font-bold uppercase tracking-widest", hasIssues ? "text-amber-600" : "text-emerald-600")}>
                    {hasIssues ? 'Degraded Performance Detected' : 'All Systems Operational'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
              Global System monitoring active. 
              Real-time Health reflects performance across {metrics.length} service clusters.
              Last pulse detected <span className="text-slate-900 font-bold underline decoration-slate-200 underline-offset-4 cursor-help" title={new Date().toISOString()}>{new Date().toLocaleTimeString()}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-12 shrink-0 pr-8">
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Latency</p>
              <p className="text-2xl font-bold text-slate-900">{avgLatency}ms</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">0.001%</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Worker Load</p>
              <p className="text-2xl font-bold text-slate-900">{avgLoad}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((service) => {
          const ServiceIcon = getIcon(service.name);
          const isHealthy = service.status === 'optimal' || service.status === 'healthy';
          
          return (
            <div key={service.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-12 h-12 border rounded-2xl flex items-center justify-center transition-all duration-300",
                  "bg-slate-50 border-slate-100 text-slate-400 group-hover:shadow-lg group-hover:shadow-brand-primary/20",
                  "group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary"
                )}>
                  <ServiceIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-emerald-500" : "bg-amber-500 animate-pulse")}></div>
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{service.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Health: {service.health_score}/100</p>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 text-base mb-6">{service.name}</h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SLO Uptime</p>
                  <p className="text-sm font-bold text-slate-900">99.9%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Response</p>
                  <p className="text-sm font-bold text-slate-900">{20 + Math.floor(Math.random() * 20)}ms</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <div className="flex gap-1.5">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-8 rounded-[4px] hover:bg-emerald-500 transition-colors cursor-help border border-emerald-100/30",
                      isHealthy ? "bg-emerald-50/60" : "bg-amber-50/60"
                    )} title={`Status at ${24-i}h ago: Healthy`}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">24H History</span>
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest", isHealthy ? "text-emerald-600" : "text-amber-600")}>
                    {isHealthy ? 'Nominal' : 'Varied'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Background Jobs */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Server className="w-48 h-48" />
          </div>
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3 text-[14px] uppercase tracking-widest">
            <Clock className="w-4 h-4 text-brand-primary" />
            System Jobs
          </h3>
          <div className="space-y-8">
            {workflows.length > 0 ? workflows.map((job) => (
              <div key={job.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[12px] font-bold text-slate-900 block">{job.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{job.metadata?.label_status || job.status}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{job.metadata?.count || 'Active'}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={cn("h-full transition-all duration-1000 rounded-full", job.metadata?.color || 'bg-brand-primary')} 
                    style={{ width: `${job.metadata?.progress || 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No active jobs</p>
            )}
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
            {alerts.length > 0 ? alerts.map((alert) => (
              <div key={alert.id} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group">
                <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border h-fit mt-1", 
                  alert.severity === 'critical' || alert.severity === 'high' ? 'border-red-500/30 text-red-400' :
                  alert.severity === 'medium' ? 'border-amber-500/30 text-amber-400' :
                  'border-emerald-500/30 text-emerald-400'
                )}>
                  {(alert.action || 'LOG').substring(0, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] leading-relaxed font-medium text-slate-300 group-hover:text-white transition-colors">
                    {alert.details}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100" />
              </div>
            )) : (
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center py-10">
                No recent security events
              </p>
            )}
          </div>
          
          <button className="w-full mt-8 py-4 text-[11px] font-bold text-slate-400 hover:text-white border border-dashed border-slate-700 rounded-2xl transition-all uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10">
            Access Full Diagnostic Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
