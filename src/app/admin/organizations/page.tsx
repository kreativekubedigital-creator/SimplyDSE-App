'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ChevronDown,
  Globe,
  Users,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

import { StatCard } from '../../../components/admin/StatCard';

interface Organisation {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
  // Mocking these for now as they might come from relations or separate tables
  users?: string;
  compliance?: number;
  region?: string;
}

import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function organizationsPage() {
  const [organizations, setorganizations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const [orgsRes, analyticsRes] = await Promise.all([
          supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('analytics_snapshots')
            .select('avg_compliance_rate')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()
        ]);
        
        if (orgsRes.data) {
          setorganizations(orgsRes.data as any);
        }
        if (analyticsRes.data) {
          setGlobalCompliance(analyticsRes.data.avg_compliance_rate);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrgs();
  }, []);

  const [globalCompliance, setGlobalCompliance] = useState(0);

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Organisation Fleet</h1>
            <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">Manage global Workspace lifecycle, System, and compliance health.</p>
          </div>
          
          <Link 
            href="/admin/organizations/new" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Provision New Workspace
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            label="Active Workspaces" 
            value={organizations.length.toString()} 
            change="Live" 
            trend="up" 
            icon={Building2} 
          />
          <StatCard 
            label="Global Compliance" 
            value={globalCompliance > 0 ? `${globalCompliance.toFixed(1)}%` : "0%"} 
            change="Target" 
            trend="neutral" 
            icon={ShieldCheck} 
          />
          <StatCard 
            label="Provisioned Environments" 
            value={organizations.length.toString()} 
            change="Synced" 
            trend="up" 
            icon={Activity} 
          />
        </div>

        {/* Table Section */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm">
          {/* Table Filters */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Workspaces..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organisation</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Region & Domain</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan & Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliance Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrgs.length > 0 ? filteredOrgs.map((org) => (
                  <tr key={org.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[14px]">{org.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-[13px] font-bold text-slate-700">{org.region || 'Global'}</p>
                        <p className="text-[11px] text-brand-primary font-bold mt-0.5 lowercase">{org.slug}.simplydse.com</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold text-slate-700 capitalize">{org.plan}</span>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit",
                          org.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          org.status === 'suspended' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                          "bg-slate-50 text-slate-600 border border-slate-100"
                        )}>
                          {org.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[13px] font-bold text-slate-700">Verified</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
                            window.location.href = `https://${org.slug}.${rootDomain}/dashboard`;
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                        >
                          Manage
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No organizations found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Total Managed Entities: {filteredOrgs.length}
            </p>
          </div>
        </div>
      </div>
  );
}
