'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Globe, 
  Zap, 
  Fingerprint,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';

import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

export default function SecurityMonitorPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    criticalEvents: 0
  });

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        const { data: logs, count } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(10);

        if (logs) {
          setEvents(logs);
          setStats({
            totalLogs: count || 0,
            criticalEvents: (logs as any[]).filter((l: any) => 
              l.action.toLowerCase().includes('delete') || 
              l.action.toLowerCase().includes('suspend') ||
              l.action.toLowerCase().includes('revoke')
            ).length
          });
        }
      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSecurityData();

    const auditSub = supabase
      .channel('security-audit-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchSecurityData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(auditSub);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Command Center</h1>
            <p className="text-[13px] text-slate-500 mt-1">Real-time threat detection, System hardening, and global security posture.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Security Audit
            </button>
            <button className="px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all active:scale-95">
              Run System Scan
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Security Score" 
            value="100/100" 
            change="Perfect" 
            trend="up" 
            icon={ShieldCheck} 
          />
          <StatCard 
            label="Security Logs" 
            value={stats.totalLogs.toString()} 
            change="Live" 
            trend="up" 
            icon={ShieldAlert} 
          />
          <StatCard 
            label="Active Threats" 
            value={stats.criticalEvents.toString()} 
            change="Recorded" 
            trend={stats.criticalEvents > 0 ? "down" : "up"} 
            icon={Fingerprint} 
          />
          <StatCard 
            label="Firewall Status" 
            value="Optimal" 
            change="Active" 
            trend="up" 
            icon={Zap} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Security Feed */}
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-slate-900">Real-time Security Health</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50">
                {events.length === 0 ? (
                  <div className="p-20 text-center">
                    <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No security events recorded in the current session.</p>
                  </div>
                ) : (
                  events.map((log) => {
                    const isCritical = log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('suspend');
                    return (
                      <div key={log.id} className="p-8 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                              isCritical ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"
                            )}>
                              {isCritical ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[15px]">{log.action}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{log.entity_type}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              isCritical ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}>
                              {isCritical ? "Critical" : "Nominal"}
                            </span>
                            <button className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1">
                              Audit Hash
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <div className="space-y-2">
                <h3 className="text-[18px] font-bold">Hardening Status</h3>
                <p className="text-white/50 text-[13px]">Platform System security metrics.</p>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Cloud Armor', value: 'Active', color: 'emerald-400' },
                  { label: 'DDoS Protection', value: 'Active', color: 'emerald-400' },
                  { label: 'SSL/TLS 1.3', value: 'Enabled', color: 'emerald-400' },
                  { label: 'Data Encryption', value: 'AES-256', color: 'emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-[13px] font-medium text-white/70">{item.label}</span>
                    <span className={cn("text-[11px] font-bold uppercase tracking-widest", `text-${item.color}`)}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-brand-light" />
                  <span className="text-[14px] font-bold">Global Origin Shield</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-light rounded-full w-[100%]" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
              <h3 className="text-[16px] font-bold text-slate-900 mb-6">Security Compliance</h3>
              <div className="space-y-6">
                {[
                  { label: 'GDPR Compliance', status: 'Passed' },
                  { label: 'SOC2 Type II', status: 'Audit Ready' },
                  { label: 'ISO 27001', status: 'Passed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
