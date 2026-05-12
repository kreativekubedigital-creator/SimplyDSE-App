'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  MoreVertical,
  Mail,
  Building2,
  Calendar,
  Lock,
  Unlock,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { cn } from '../../../lib/utils';

import { StatCard } from '../../../components/admin/StatCard';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id: string;
  created_at: string;
  avatar_url?: string;
  organizations?: {
    name: string;
  };
  // Mocking visual-only fields
  status?: string;
  lastActive?: string;
  security?: string;
}

import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function UserDirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select(`
            *,
            organizations (
              name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (data) {
          const enhanced = data.map(p => ({
            ...p,
            status: 'Active',
            lastActive: 'Now',
            security: 'Verified'
          }));
          setProfiles(enhanced);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">User Identity & Access</h1>
            <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">Global directory for all platform identities and role-based access controls.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Security Audit
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              <UserPlus className="w-4 h-4" />
              Invite User
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Identities" 
            value={profiles.length.toString()} 
            change={profiles.length > 0 ? "+100%" : "0%"} 
            trend="up" 
            icon={Users} 
          />
          <StatCard 
            label="Active Sessions" 
            value={profiles.length > 0 ? "1" : "0"} 
            change="0%" 
            trend="neutral" 
            icon={UserCheck} 
          />
          <StatCard 
            label="MFA Compliance" 
            value="100%" 
            change="0%" 
            trend="neutral" 
            icon={ShieldCheck} 
          />
          <StatCard 
            label="Security Alerts" 
            value="0" 
            change="0" 
            trend="down" 
            icon={ShieldAlert} 
          />
        </div>

        {/* Filters Bar */}
        <div className="overflow-x-auto pb-4 -mb-4">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-max border border-slate-200/60">
            {['All', 'Super Admin', 'Workspace Admin', 'Compliance Officer', 'Employee'].map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 whitespace-nowrap",
                  filter === role 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Main Directory Table */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          {/* Table Filters */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or Organisation..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Bulk Actions
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organisation</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Access Rights</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Security</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Activity</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profiles
                  .filter(p => filter === 'All' || p.role.replace('_', ' ').toLowerCase().includes(filter.toLowerCase()))
                  .filter(p => 
                    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                    p.email.toLowerCase().includes(search.toLowerCase()) ||
                    p.organizations?.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-500 font-bold text-[11px] group-hover:scale-110 transition-transform overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.split(' ').map(n => n[0]).join('') || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[14px]">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-[11px] text-slate-400 font-medium lowercase">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-700">{user.organizations?.name || 'Platform'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={user.role}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          try {
                            const { error } = await supabase
                              .from('profiles')
                              .update({ role: newRole })
                              .eq('id', user.id);
                            
                            if (error) throw error;
                            
                            // Update local state
                            setProfiles(prev => prev.map(p => 
                              p.id === user.id ? { ...p, role: newRole } : p
                            ));
                          } catch (err) {
                            console.error('Failed to update user role:', err);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border-none focus:ring-0 cursor-pointer appearance-none transition-all",
                          user.role === 'super_admin' ? "bg-slate-900 text-white" :
                          user.role === 'org_admin' ? "bg-brand-primary/10 text-brand-primary" :
                          "bg-slate-100 text-slate-600"
                        )}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="org_admin">Org Admin</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "flex items-center gap-1.5 text-[11px] font-bold",
                        user.security === 'Verified' ? "text-emerald-600" :
                        user.security === 'High Risk' ? "text-red-600" : "text-amber-600"
                      )}>
                        {user.security === 'Verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {user.security}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-[12px] font-bold text-slate-900">{user.status}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{user.lastActive}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Page 1 of 124 (12,412 total)</p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">Next</button>
            </div>
          </div>
        </div>
      </div>
  );
}
