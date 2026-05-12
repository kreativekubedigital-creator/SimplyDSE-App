'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail,
  ShieldAlert,
  CheckCircle2,
  Users
} from 'lucide-react';
import Badge from '../../ui/Badge';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status?: string;
  organization_id: string;
  organizations?: {
    name: string;
  };
}

const getRoleBadgeVariant = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'super_admin': return 'primary';
    case 'org_admin': return 'warning';
    default: return 'neutral';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'suspended': return 'danger';
    default: return 'neutral';
  }
};

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .order('full_name', { ascending: true });

      if (data) setUsers(data as any);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.organizations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hydrating User Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Platform Users</h2>
          <p className="text-sm text-text-secondary mt-1">Manage global user accounts, roles, and security sessions.</p>
        </div>
        <button className="btn-enterprise-primary !py-2.5 !px-5 !text-xs !rounded-xl !gap-2">
          <UserPlus className="w-4 h-4" />
          Add Platform Admin
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border-subtle rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, email, or Organisation..."
              className="w-full bg-bg-muted/50 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm focus:border-brand-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-secondary border border-border-subtle rounded-xl hover:bg-bg-muted transition-all">
            <Filter className="w-3.5 h-3.5" />
            Advanced Filters
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-border-subtle rounded-xl">
            <Users className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Total: {users.length}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Directory</span>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-muted/50">
              <th className="table-header !py-3">User</th>
              <th className="table-header !py-3">Organisation</th>
              <th className="table-header !py-3">Role</th>
              <th className="table-header !py-3">Status</th>
              <th className="table-header !py-3 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-bg-muted/30 transition-colors group">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center font-bold text-brand-primary text-[10px] border border-brand-primary/10">
                      {(user.full_name || 'U').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">{user.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-tight">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <span className="text-xs font-bold text-text-secondary">{user.organizations?.name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                      {(user.role || 'user').replace('_', ' ')}
                    </Badge>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(user.status || 'active')}>
                      {user.status || 'active'}
                    </Badge>
                  </div>
                </td>
                <td className="table-cell text-right pr-8">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all" title="Reset Password">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all" title="Suspend Account">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-muted rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-text-muted font-bold uppercase tracking-widest text-xs italic">
                  No users matched your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
