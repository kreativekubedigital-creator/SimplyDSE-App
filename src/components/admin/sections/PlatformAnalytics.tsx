'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight,
  Activity,
  BarChart3,
  Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Snapshot {
  timestamp: string;
  total_tenants: number;
  active_users: number;
  avg_compliance_rate: number;
}

interface Org {
  name: string;
  plan: string;
  region: string;
}

export function PlatformAnalytics() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [snapshotsRes, orgsRes] = await Promise.all([
          supabase
            .from('analytics_snapshots')
            .select('timestamp, total_tenants, active_users, avg_compliance_rate')
            .order('timestamp', { ascending: true })
            .limit(12),
          supabase
            .from('organizations')
            .select('name, plan, region')
            .limit(4)
        ]);

        if (snapshotsRes.data) setSnapshots(snapshotsRes.data);
        if (orgsRes.data) setOrgs(orgsRes.data as any);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating Analytics...</p>
        </div>
      </div>
    );
  }

  const latestSnapshot = snapshots[snapshots.length - 1] || { total_tenants: 0, avg_compliance_rate: 0, active_users: 0 };
  const firstSnapshot = snapshots[0] || { total_tenants: 0 };
  const growthPercent = firstSnapshot.total_tenants > 0 
    ? ((latestSnapshot.total_tenants - firstSnapshot.total_tenants) / firstSnapshot.total_tenants * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Platform Analytics</h2>
          <p className="text-sm text-text-secondary mt-1">Global performance metrics, tenant growth, and compliance trends.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border-subtle p-1 rounded-xl shadow-sm">
          {['24h', '7d', '30d', '90d'].map((period) => (
            <button key={period} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              period === '30d' ? 'bg-text-primary text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-bg-muted'
            }`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tenant Growth */}
        <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Tenant Growth</p>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">{latestSnapshot.total_tenants} Active Orgs</h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{growthPercent}%</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-2">
            {snapshots.map((s, i) => (
              <div key={i} className="flex-1 bg-brand-light/50 rounded-t-lg relative group transition-all hover:bg-brand-primary">
                <div 
                  className="w-full bg-brand-primary/20 rounded-t-lg transition-all group-hover:bg-brand-primary h-full" 
                  style={{ height: `${(s.total_tenants / (latestSnapshot.total_tenants || 1)) * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[9px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
                  {s.total_tenants} orgs
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[9px] font-bold text-text-muted uppercase tracking-[0.3em]">
            <span>{snapshots[0] ? new Date(snapshots[0].timestamp).toLocaleDateString('en-US', { month: 'short' }) : 'Start'}</span>
            <span>Current Period</span>
            <span>{snapshots[snapshots.length-1] ? new Date(snapshots[snapshots.length-1].timestamp).toLocaleDateString('en-US', { month: 'short' }) : 'End'}</span>
          </div>
        </div>

        {/* Compliance Completion */}
        <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Compliance Rate</p>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">{latestSnapshot.avg_compliance_rate.toFixed(1)}% Average</h3>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stable</span>
            </div>
          </div>
          <div className="relative h-48 flex items-center justify-center">
            {/* Simple Circular Viz */}
            <div className="w-36 h-36 rounded-full border-[14px] border-bg-muted relative flex flex-col items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full border-[14px] border-brand-primary border-r-transparent border-b-transparent -rotate-45"
                style={{ clipPath: `polygon(50% 50%, -50% -50%, ${latestSnapshot.avg_compliance_rate}% -50%)` }}
              ></div>
              <span className="text-3xl font-bold text-text-primary tracking-tighter">{Math.round(latestSnapshot.avg_compliance_rate)}%</span>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">Health Score</span>
            </div>
            <div className="absolute right-0 top-0 space-y-6">
              <div className="text-right">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Active Users</p>
                <p className="text-lg font-bold text-text-primary tracking-tight">{latestSnapshot.active_users.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Reporting Regions</p>
                <p className="text-lg font-bold text-brand-primary tracking-tight">Global</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Tenants */}
      <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-sm">
        <h3 className="font-bold text-text-primary text-sm uppercase tracking-[0.2em] mb-10 border-b border-border-subtle pb-4">Live Organization Fleet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {orgs.map((tenant) => (
            <div key={tenant.name} className="space-y-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">{tenant.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-text-muted">
                  <span>Plan Type</span>
                  <span className="text-text-primary capitalize">{tenant.plan}</span>
                </div>
                <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-1000 w-full opacity-20" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  <Globe className="w-3 h-3" />
                  {tenant.region}
                </div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
