'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Lock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Globe,
  Settings,
  MoreVertical,
  Key
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';


import { supabase } from '@/lib/supabase';

export default function RolesManagementPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchRoleStats() {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('role');
        
        if (profiles) {
          const stats = profiles.reduce((acc: any, curr: any) => {
            acc[curr.role] = (acc[curr.role] || 0) + 1;
            return acc;
          }, {});
          setRoleStats(stats);
        }
      } catch (error) {
        console.error('Error fetching role stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoleStats();
  }, []);

  const rolesList = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Root-level access to the entire platform infrastructure, global settings, and cross-tenant data.',
      usersCount: roleStats.super_admin || 0,
      tier: 'Core',
      permissions: ['*'],
      status: 'Restricted',
      color: 'slate-900'
    },
    {
      id: 'org_admin',
      name: 'Organization Admin',
      description: 'Full administrative control within a specific tenant environment. Can manage users and settings for their org.',
      usersCount: roleStats.org_admin || 0,
      tier: 'Tenant',
      permissions: ['manage_users', 'manage_org_settings', 'view_all_assessments'],
      status: 'Active',
      color: 'brand-primary'
    },
    {
      id: 'user',
      name: 'Standard Employee',
      description: 'End-user access to the platform for completing self-assessments and viewing personal compliance status.',
      usersCount: roleStats.user || 0,
      tier: 'Standard',
      permissions: ['complete_own_assessment', 'view_personal_profile'],
      status: 'Active',
      color: 'blue-500'
    }
  ];

  const totalIdentities = Object.values(roleStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Control & RBAC</h1>
            <p className="text-[13px] text-slate-500 mt-1">Global definition of roles, permissions, and hierarchical access policies.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all active:scale-95">
            <Lock className="w-4 h-4" />
            Global Permission Policy
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Defined Roles" 
            value={rolesList.length.toString()} 
            change="Live" 
            trend="neutral" 
            icon={Shield} 
          />
          <StatCard 
            label="Assigned Identities" 
            value={totalIdentities.toLocaleString()} 
            change={totalIdentities > 0 ? "+100%" : "0%"} 
            trend="up" 
            icon={Users} 
          />
          <StatCard 
            label="Root Accounts" 
            value={(roleStats.super_admin || 0).toString().padStart(2, '0')} 
            change="Secure" 
            trend="up" 
            icon={Key} 
          />
          <StatCard 
            label="IAM Health" 
            value="Optimal" 
            change="Nominal" 
            trend="up" 
            icon={Zap} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Roles Grid */}
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-bold text-slate-900">Platform Identity Hierarchy</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search roles..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none focus:ring-2 focus:ring-brand-primary/5 transition-all w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {rolesList.map((role) => (
                <div key={role.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform duration-500",
                        role.id === 'super_admin' ? "bg-slate-900 border-slate-800 text-white" :
                        role.id === 'org_admin' ? "bg-brand-primary/5 border-brand-primary/10 text-brand-primary" :
                        role.id === 'dse_assessor' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                        "bg-blue-50 border-blue-100 text-blue-500"
                      )}>
                        <Shield className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[18px] font-bold text-slate-900">{role.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                            {role.tier}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 max-w-xl leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-slate-900">{role.usersCount}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identities</p>
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold",
                        role.status === 'Restricted' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                        {role.status === 'Restricted' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {role.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center gap-2">
                    {role.permissions.map((perm) => (
                      <span key={perm} className="px-3 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-lg border border-slate-100">
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))}
                    <button className="ml-auto flex items-center gap-2 text-[11px] font-bold text-brand-primary hover:underline">
                      Edit Permissions
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - System Policy */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="space-y-2">
                <h3 className="text-[18px] font-bold text-slate-900">Security Guardrails</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">System-wide enforcement policies for Role-Based Access Control.</p>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Inherit Permissions', desc: 'Child roles inherit parent permissions', active: true },
                  { label: 'Cross-Tenant Isolation', desc: 'Strict data boundary enforcement', active: true },
                  { label: 'MFA Enforcement', desc: 'Required for administrative roles', active: true },
                  { label: 'Audit Logging', desc: 'Immutable trail for every action', active: true },
                ].map((policy, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="mt-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">{policy.label}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{policy.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                View Global IAM Schema
              </button>
            </div>

            <div className="bg-brand-primary rounded-[2.5rem] p-10 text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <Key className="w-10 h-10 opacity-40 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-[20px] font-bold leading-tight">Emergency Access Break-Glass</h3>
                <p className="text-white/70 text-[13px] leading-relaxed">
                  Generate one-time bypass keys for mission-critical infrastructure recovery.
                </p>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all">
                  Initiate Recovery Protocol
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
            </div>
          </div>
        </div>
    </div>
  );
}
