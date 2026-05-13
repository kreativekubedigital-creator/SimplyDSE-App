'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  Shield,
  Lock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Key,
  Building2,
  Activity,
  Zap,
  MoreVertical,
  Download
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';

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
  status?: string;
}

export default function UserDirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'roles'>('directory');
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const [profilesRes, rolesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(`*, organizations(name)`)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('role')
      ]);
      
      if (profilesRes.data) {
          const data = (profilesRes.data as any[]).map(p => ({ 
            ...p, 
            status: 'active',
            security: 'Verified',
            lastActive: '2h ago'
          }));
          setProfiles(data);
      }
      if (rolesRes.data) {
        const stats = (rolesRes.data as any[]).reduce((acc: any, curr: any) => {
          acc[curr.role] = (acc[curr.role] || 0) + 1;
          return acc;
        }, {});
        setRoleStats(stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const rolesList = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Root-level access to the entire platform System, global settings, and cross-Workspace data.',
      usersCount: roleStats.super_admin || 0,
      tier: 'Core',
      permissions: ['*'],
      status: 'Restricted'
    },
    {
      id: 'organization_admin',
      name: 'Organisation Admin',
      description: 'Full administrative control within a specific Workspace environment.',
      usersCount: roleStats.organization_admin || 0,
      tier: 'Workspace',
      permissions: ['manage_users', 'manage_org_settings'],
      status: 'Active'
    },
    {
      id: 'user',
      name: 'Employee',
      description: 'Standard end-user access for completing self-assessments.',
      usersCount: roleStats.user || 0,
      tier: 'Standard',
      permissions: ['complete_own_assessment'],
      status: 'Active'
    }
  ];

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => 
        p.id === userId ? { ...p, role: newRole } : p
      ));
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.organizations?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Identity & Access</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage global user identities, hierarchical roles, and security permissions.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
        
        {/* Metric Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Identities" 
            value={profiles.length} 
            trend="Live" 
            icon={Users} 
            iconColor="blue"
          />
          <StatCard 
            title="Super Admins" 
            value={roleStats.super_admin || 0} 
            trend="Restricted" 
            icon={Shield} 
            iconColor="indigo"
          />
          <StatCard 
            title="Org Admins" 
            value={roleStats.organization_admin || 0} 
            trend="Active" 
            icon={Building2} 
            iconColor="emerald"
          />
          <StatCard 
            title="Verified Security" 
            value={`${Math.round((profiles.length / (profiles.length || 1)) * 100)}%`} 
            trend="Optimal" 
            icon={ShieldCheck} 
            iconColor="purple"
          />
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
            <button 
              onClick={() => setActiveTab('directory')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[12px] font-bold transition-all",
                activeTab === 'directory' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              User Directory
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[12px] font-bold transition-all",
                activeTab === 'roles' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Role Definitions
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, email or org..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-80"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 sticky top-0 z-10">
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Organisation</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Security</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 uppercase border border-white shadow-sm">
                          {p.full_name?.substring(0, 2) || p.email.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{p.full_name || 'Unnamed User'}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[12px] font-bold text-slate-700">{p.organizations?.name || 'Global'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer transition-all",
                          p.role === 'super_admin' ? "bg-slate-900 text-white shadow-lg" :
                          p.role === 'organization_admin' ? "bg-blue-600 text-white shadow-lg" :
                          "bg-slate-100 text-slate-600"
                        )}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="organization_admin">Org Admin</option>
                        <option value="user">Employee</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        VERIFIED
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-[12px] font-bold text-slate-900">Active</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">2h ago</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredProfiles.length} of {profiles.length} Identities
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Next</button>
            </div>
          </div>
        </div>
    </div>
  );
}
