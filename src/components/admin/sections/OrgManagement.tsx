'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  ArrowUpRight,
  ExternalLink,
  Users,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '../../ui/Badge';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  region: string;
  created_at: string;
}

export function OrgManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  async function fetchOrgs() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setOrganizations(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrgs();

    // Real-time subscription
    const channel = supabase
      .channel('organizations-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'organizations' 
      }, () => {
        fetchOrgs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleStatus = async (org: Organization) => {
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus })
        .eq('id', org.id);
      
      if (error) throw error;
      
      // Update local state
      setOrganizations(prev => prev.map(o => 
        o.id === org.id ? { ...o, status: newStatus } : o
      ));
    } catch (err) {
      console.error('Failed to toggle organization status:', err);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    active: organizations.filter(o => o.status === 'active').length,
    suspended: organizations.filter(o => o.status === 'suspended').length,
    pending: organizations.filter(o => o.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Organization Management</h2>
          <p className="text-sm text-text-secondary mt-1">Monitor and manage all tenant organizations across the platform.</p>
        </div>
        <button className="btn-enterprise-primary !py-2.5 !px-5 !text-xs !rounded-xl !gap-2">
          <Plus className="w-4 h-4" />
          Provision New Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border-subtle rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or domain..."
              className="w-full bg-bg-muted/50 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm focus:border-brand-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6 pr-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{statusCounts.active} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{statusCounts.pending} Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{statusCounts.suspended} Suspended</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container shadow-sm overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-bg-muted/50">
              <th className="table-header !py-4 px-6">Organization</th>
              <th className="table-header !py-4 px-6">Status</th>
              <th className="table-header !py-4 px-6">Plan</th>
              <th className="table-header !py-4 px-6">Region</th>
              <th className="table-header !py-4 px-6">Health</th>
              <th className="table-header !py-4 px-6 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {filteredOrgs.length > 0 ? filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-bg-muted/30 transition-colors group">
                <td className="table-cell px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-text-primary/5 flex items-center justify-center text-text-primary border border-border-subtle">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm group-hover:text-brand-primary transition-colors">{org.name}</p>
                      <div className="flex items-center gap-1 text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-widest">
                        <span>{org.slug}.simplydse.com</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-cell px-6">
                  <Badge variant={
                    org.status === 'active' ? 'success' : 
                    org.status === 'pending' ? 'warning' : 'danger'
                  }>
                    {org.status}
                  </Badge>
                </td>
                <td className="table-cell px-6 text-[11px] font-bold text-text-secondary tracking-wide uppercase">
                  {org.plan}
                </td>
                <td className="table-cell px-6">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{org.region || 'Global'}</span>
                </td>
                <td className="table-cell px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-bg-muted rounded-full overflow-hidden w-24">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          org.status === 'active' ? "bg-emerald-500" : "bg-slate-200"
                        )} 
                        style={{ width: org.status === 'active' ? '100%' : '20%' }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-text-primary">{org.status === 'active' ? '98%' : 'N/A'}</span>
                  </div>
                </td>
                <td className="table-cell text-right pr-8">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => toggleStatus(org)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                        org.status === 'active' 
                          ? "text-rose-600 hover:bg-rose-50" 
                          : "text-emerald-600 hover:bg-emerald-50"
                      )}
                    >
                      {org.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all" title="Manage Tenant">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-20 text-center text-text-muted font-bold uppercase tracking-widest text-xs italic">
                  No organizations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Summary */}
      <div className="flex items-center justify-between px-2 pt-2">
        <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
          Total Fleet size: <span className="text-text-primary">{organizations.length}</span> Entities
        </p>
      </div>
    </div>
  );
}
