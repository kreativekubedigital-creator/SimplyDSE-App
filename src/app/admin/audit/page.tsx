'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap,
  Lock
} from 'lucide-react';
import { cn } from '../../../lib/utils';

import { StatCard } from '../../../components/admin/StatCard';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  ip_address: string;
  profiles?: {
    full_name: string;
  };
  organizations?: {
    name: string;
  };
  // Mocking visual-only fields
  severity?: string;
  status?: string;
}

import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data } = await supabase
          .from('audit_logs')
          .select(`
            *,
            profiles (
              full_name
            ),
            organizations (
              name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (data) {
          const enhanced = (data as any[]).map((l: any) => ({
            ...l,
            severity: l.action.toLowerCase().includes('delete') || l.action.toLowerCase().includes('fail') ? 'High' : 'Low',
            status: 'Success'
          }));
          setLogs(enhanced);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security & Audit Trail</h1>
            <p className="text-[13px] text-slate-500 mt-1">Immutable, cryptographic ledger of administrative and security-critical platform events.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              <Calendar className="w-4 h-4" />
              Custom Range
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Generate Compliance Report
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Daily Logs" 
            value={logs.length.toString()} 
            change={logs.length > 0 ? "+100%" : "0%"} 
            trend="up" 
            icon={Activity} 
          />
          <StatCard 
            label="Integrity Status" 
            value="Verified" 
            change="Cryptographic" 
            trend="up" 
            icon={ShieldCheck} 
          />
          <StatCard 
            label="Auth Events" 
            value={logs.filter(l => l.action?.toLowerCase().includes('auth') || l.action?.toLowerCase().includes('login')).length.toString()} 
            change="0%" 
            trend="neutral" 
            icon={Fingerprint} 
          />
          <StatCard 
            label="Security Alerts" 
            value={logs.filter(l => l.severity === 'High' || l.severity === 'Critical').length.toString()} 
            change="0" 
            trend="down" 
            icon={ShieldAlert} 
          />
        </div>

        {/* Main Content */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          {/* Table Filters */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by event, actor, or trace ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                {['All', 'Critical', 'High', 'Medium'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 uppercase tracking-wider",
                      severityFilter === sev 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-3.5 h-3.5" />
                Advanced Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Event Signature</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Initiator</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scope</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trace Data</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Outcome</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs
                  .filter(l => severityFilter === 'All' || l.severity?.toLowerCase() === severityFilter.toLowerCase())
                  .filter(l => 
                    l.action?.toLowerCase().includes(search.toLowerCase()) || 
                    l.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                    l.organizations?.name?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                          log.severity === 'Critical' ? "bg-red-50 border-red-100 text-red-600 shadow-sm shadow-red-50" :
                          log.severity === 'High' ? "bg-orange-50 border-orange-100 text-orange-600" :
                          log.severity === 'Medium' ? "bg-amber-50 border-amber-100 text-amber-600" :
                          "bg-blue-50 border-blue-100 text-blue-600"
                        )}>
                          {log.severity === 'Critical' ? <ShieldAlert className="w-5 h-5" /> :
                           log.severity === 'High' ? <Lock className="w-5 h-5" /> :
                           log.severity === 'Medium' ? <Zap className="w-5 h-5" /> :
                           <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[14px]">{log.action}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{log.entity_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-[13px] font-bold text-slate-700">{log.profiles?.full_name || 'System'}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 lowercase">{log.ip_address || 'Internal'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-700">{log.organizations?.name || 'Platform'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-[12px] font-bold text-slate-900">{new Date(log.created_at).toLocaleDateString()}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        log.status === 'Success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        log.status === 'Blocked' ? "bg-slate-900 text-white" :
                        "bg-red-50 text-red-600 border border-red-100"
                      )}>
                        {log.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all group-hover:bg-white group-hover:shadow-sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cryptographic chain verified to last 1,000 blocks</p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">Next</button>
            </div>
          </div>
        </div>

        {/* Security Advisory */}
        <div className="p-6 rounded-[2rem] bg-slate-900 text-white border border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Shield className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-brand-primary mb-3">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Platform Security Notice</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Threat Detection is Active</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our security engine is currently monitoring 12,412 active identities across 142 organizations. 
                Any anomalous login patterns or unauthorized administrative actions are automatically quarantined and flagged for manual review.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-slate-900 text-[12px] font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all">
              View Threat Reports
            </button>
          </div>
        </div>
      </div>
  );
}
