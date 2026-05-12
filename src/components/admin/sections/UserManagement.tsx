'use client';

import React, { useState } from 'react';
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

const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@acme.com', org: 'Acme Corp', role: 'Org Owner', status: 'Active', mfa: true },
  { id: 2, name: 'Bob Smith', email: 'bob@logistics.com', org: 'Global Logistics', role: 'Compliance Officer', status: 'Active', mfa: true },
  { id: 3, name: 'Charlie Davis', email: 'charlie@techflow.io', org: 'TechFlow Systems', role: 'HR Manager', status: 'Pending', mfa: false },
  { id: 4, name: 'Diana Prince', email: 'diana@simplydse.com', org: 'SimplyDSE', role: 'Super Admin', status: 'Active', mfa: true },
  { id: 5, name: 'Edward Norton', email: 'edward@nexus.com', org: 'Nexus Energy', role: 'Employee', status: 'Suspended', mfa: true },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

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
              placeholder="Search by name, email, or organization..."
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
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Total: 12.4k</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Online: 842</span>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-muted/50">
              <th className="table-header !py-3">User</th>
              <th className="table-header !py-3">Organization</th>
              <th className="table-header !py-3">Role</th>
              <th className="table-header !py-3">Status</th>
              <th className="table-header !py-3 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-bg-muted/30 transition-colors group">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center font-bold text-brand-primary text-[10px] border border-brand-primary/10">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">{user.name}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-tight">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <span className="text-xs font-bold text-text-secondary">{user.org}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      user.status === 'Active' ? 'success' : 
                      user.status === 'Suspended' ? 'warning' : 'neutral'
                    }>
                      {user.status}
                    </Badge>
                    {user.mfa && (
                      <span title="MFA Enabled">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </span>
                    )}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
