'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Search, Plus, ExternalLink, ShieldCheck, Activity,
  ArrowUpRight, Globe, Users, Mail, Eye, Pencil, Pause, Play, 
  Trash2, X, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { resendWelcomeEmail } from '../../../app/actions/resend-welcome-email';
import { StatCard } from '../../../components/admin/StatCard';
import { supabase } from '@/lib/supabase';

interface Organisation {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
  region?: string;
  industry?: string;
  logo_url?: string;
  admin_email?: string;
  user_count?: number;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [globalCompliance, setGlobalCompliance] = useState(0);
  
  // Modal states
  const [viewOrg, setViewOrg] = useState<Organisation | null>(null);
  const [editOrg, setEditOrg] = useState<Organisation | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organisation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editIndustry, setEditIndustry] = useState('');

  async function fetchOrgs() {
    try {
      const [orgsRes, analyticsRes] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('analytics_snapshots').select('avg_compliance_rate').order('timestamp', { ascending: false }).limit(1).maybeSingle()
      ]);
      
      if (orgsRes.data) {
        // Fetch user counts per org
        const orgIds = orgsRes.data.map((o: any) => o.id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('organization_id')
          .in('organization_id', orgIds);

        const userCounts: Record<string, number> = {};
        profiles?.forEach((p: any) => {
          userCounts[p.organization_id] = (userCounts[p.organization_id] || 0) + 1;
        });

        // Fetch admin emails
        const { data: admins } = await supabase
          .from('profiles')
          .select('organization_id, email')
          .in('organization_id', orgIds)
          .in('role', ['organization_admin', 'org_admin']);

        const adminEmails: Record<string, string> = {};
        admins?.forEach((a: any) => {
          if (!adminEmails[a.organization_id]) adminEmails[a.organization_id] = a.email;
        });

        const formatted = orgsRes.data.map((org: any) => ({
          ...org,
          user_count: userCounts[org.id] || 0,
          admin_email: adminEmails[org.id] || null,
        }));
        setOrganizations(formatted);
      }
      if (analyticsRes?.data) {
        setGlobalCompliance(analyticsRes.data.avg_compliance_rate || 0);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrgs(); }, []);

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.slug.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = organizations.filter(o => o.status === 'active').length;
  const suspendedCount = organizations.filter(o => o.status === 'suspended').length;

  // ACTIONS
  async function handleSuspendToggle(org: Organisation) {
    setActionLoading(true);
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('organizations').update({ status: newStatus }).eq('id', org.id);
    if (!error) {
      setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: newStatus } : o));
    }
    setActionLoading(false);
    setActionMenuId(null);
  }

  async function handleDelete() {
    if (!deleteOrg) return;
    setActionLoading(true);
    const { error } = await supabase.from('organizations').delete().eq('id', deleteOrg.id);
    if (!error) {
      setOrganizations(prev => prev.filter(o => o.id !== deleteOrg.id));
      setDeleteOrg(null);
    } else {
      alert('Failed to delete: ' + error.message);
    }
    setActionLoading(false);
  }

  async function handleEditSave() {
    if (!editOrg) return;
    setActionLoading(true);
    const { error } = await supabase.from('organizations').update({
      name: editName,
      plan: editPlan,
      region: editRegion,
      industry: editIndustry,
    }).eq('id', editOrg.id);
    if (!error) {
      setOrganizations(prev => prev.map(o => o.id === editOrg.id ? { ...o, name: editName, plan: editPlan, region: editRegion, industry: editIndustry } : o));
      setEditOrg(null);
    } else {
      alert('Failed to update: ' + error.message);
    }
    setActionLoading(false);
  }

  function openEdit(org: Organisation) {
    setEditName(org.name);
    setEditPlan(org.plan);
    setEditRegion(org.region || '');
    setEditIndustry(org.industry || '');
    setEditOrg(org);
    setActionMenuId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Organisation Fleet</h1>
          <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">Manage global Workspace lifecycle, status, and compliance health.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Workspaces" value={organizations.length.toString()} change="Managed" trend="up" icon={Building2} />
        <StatCard label="Active Workspaces" value={activeCount.toString()} change="Operating" trend="up" icon={Activity} />
        <StatCard label="Suspended" value={suspendedCount.toString()} change={suspendedCount > 0 ? "Needs Attention" : "None"} trend={suspendedCount > 0 ? "down" : "neutral"} icon={Pause} />
        <StatCard label="Global Compliance" value={globalCompliance > 0 ? `${globalCompliance.toFixed(1)}%` : "0%"} change="Target" trend="neutral" icon={ShieldCheck} />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Search Workspaces..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
              value={search} onChange={(e) => setSearch(e.target.value)}
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
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Users</th>
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
                      <p className="text-[11px] text-brand-primary font-bold mt-0.5 lowercase">{org.slug}.simplydse.online</p>
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
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-bold text-slate-700">{org.user_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="relative inline-block">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewOrg(org)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(org)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleSuspendToggle(org)} className={cn("p-2 rounded-lg transition-all", org.status === 'active' ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50")} title={org.status === 'active' ? 'Suspend' : 'Activate'}>
                          {org.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteOrg(org)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* VIEW DRAWER */}
      {viewOrg && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setViewOrg(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Organisation Details</h2>
              <button onClick={() => setViewOrg(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center"><Building2 className="w-8 h-8 text-brand-primary" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewOrg.name}</h3>
                  <p className="text-sm text-brand-primary font-medium">{viewOrg.slug}.simplydse.online</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Status', value: viewOrg.status, highlight: viewOrg.status === 'active' },
                  { label: 'Plan', value: viewOrg.plan },
                  { label: 'Region', value: viewOrg.region || 'Global' },
                  { label: 'Industry', value: viewOrg.industry || 'N/A' },
                  { label: 'Users', value: (viewOrg.user_count || 0).toString() },
                  { label: 'Created', value: new Date(viewOrg.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={cn("text-[14px] font-bold capitalize", item.highlight ? "text-emerald-600" : "text-slate-900")}>{item.value}</p>
                  </div>
                ))}
              </div>
              {viewOrg.admin_email && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HR Admin Email</p>
                  <p className="text-sm font-bold text-slate-900">{viewOrg.admin_email}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => { openEdit(viewOrg); setViewOrg(null); }} className="flex-1 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl hover:scale-[1.02] transition-all">Edit Organisation</button>
                <button onClick={() => { handleSuspendToggle(viewOrg); setViewOrg(null); }} className={cn("flex-1 py-3 text-[12px] font-bold rounded-xl border transition-all", viewOrg.status === 'active' ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50")}>
                  {viewOrg.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {editOrg && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setEditOrg(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Edit Organisation</h2>
                <button onClick={() => setEditOrg(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organisation Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan</label>
                    <select value={editPlan} onChange={e => setEditPlan(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all appearance-none">
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Region</label>
                    <input type="text" value={editRegion} onChange={e => setEditRegion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Industry</label>
                  <input type="text" value={editIndustry} onChange={e => setEditIndustry(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all" />
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-3">
                <button onClick={() => setEditOrg(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleEditSave} disabled={actionLoading} className="flex-1 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteOrg && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setDeleteOrg(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-rose-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Delete Organisation</h2>
                <p className="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{deleteOrg.name}</strong>? 
                  This will remove all associated data and cannot be undone.
                </p>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-3">
                <button onClick={() => setDeleteOrg(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 bg-rose-600 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                  {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
