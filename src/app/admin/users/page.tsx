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
  Download,
  X,
  Loader2,
  AlertCircle,
  Mail
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { inviteUserAction } from '@/app/actions/invite-user';

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
  const [showAddUserModal, setShowAddUserModal] = useState(false);

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
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all"
            >
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
        {activeTab === 'directory' && (
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
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            {rolesList.map((role) => (
              <div key={role.id} className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2rem] p-8 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      role.id === 'super_admin' ? "bg-slate-900 text-white" :
                      role.id === 'organization_admin' ? "bg-blue-600 text-white" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-slate-900">{role.name}</h3>
                      <p className="text-[12px] text-slate-500 mt-1 max-w-md">{role.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier: {role.tier}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">•</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role.usersCount} Users</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight",
                    role.status === 'Restricted' ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  )}>
                    {role.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <AddUserModal 
            onClose={() => setShowAddUserModal(false)} 
            onSuccess={() => {
              setShowAddUserModal(false);
              fetchProfiles();
            }}
          />
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Add User Modal Component
// ─────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('super_admin');
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setTempPassword(pass);
  }

  function copyPassword() {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassword || tempPassword.length < 6) {
      setError('Temporary password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const result = await inviteUserAction(email, role, fullName, tempPassword);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user.');
      }
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      console.error('Add user error:', err);
      setError(err.message || 'An error occurred while creating the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal — compact & scrollable */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all z-20">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Header — compact */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Platform User</h2>
              <p className="text-xs text-slate-500">Create a new user with login credentials.</p>
            </div>
          </div>

          {/* Success State */}
          {success && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-base font-bold text-slate-900">User Created Successfully</p>
              <p className="text-xs text-slate-500 mt-1">They can now login with the temporary password.</p>
            </div>
          )}

          {/* Error */}
          {error && !success && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-rose-800">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all text-slate-900 font-medium text-sm"
                  placeholder="John Smith" required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all text-slate-900 font-medium text-sm"
                    placeholder="user@company.com" required
                  />
                </div>
              </div>

              {/* Temporary Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Temporary Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all text-slate-900 font-medium text-sm font-mono"
                      placeholder="Min 6 characters" required minLength={6}
                    />
                  </div>
                  <button type="button" onClick={generatePassword} className="px-3 py-2.5 bg-brand-primary/5 text-brand-primary text-[10px] font-bold rounded-xl hover:bg-brand-primary/10 transition-all whitespace-nowrap border border-brand-primary/10">
                    Generate
                  </button>
                </div>
                {tempPassword && (
                  <button type="button" onClick={copyPassword} className="text-[10px] font-bold text-brand-primary hover:underline mt-1">
                    {copied ? '✓ Copied!' : 'Copy to clipboard'}
                  </button>
                )}
              </div>

              {/* Role Selector — compact */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'super_admin', label: 'Super Admin', icon: Shield },
                    { id: 'organization_admin', label: 'Org Admin', icon: Building2 },
                    { id: 'user', label: 'Employee', icon: Users },
                  ].map((r) => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                        role === r.id 
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg" 
                          : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                      )}
                    >
                      <r.icon className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {role === 'super_admin' && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                    Super Admins have unrestricted platform access including cross-workspace data and system configuration.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isSubmitting || !email || !fullName || !tempPassword}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

