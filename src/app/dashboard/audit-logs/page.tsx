'use client';

import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  User, 
  Lock, 
  ClipboardList, 
  Settings, 
  Eye, 
  MoreHorizontal,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useProfile } from '@/hooks/useProfile';

const auditLogs = [
  { id: 'LOG-8842', user: 'HR_MANAGER_NAME', action: 'Modified Workflow', details: 'Updated "Annual Re-assessment" trigger from 12m to 6m.', target: 'WF-001', time: '10 mins ago', category: 'Configuration', ip: '192.168.1.42' },
  { id: 'LOG-8841', user: 'System (Auto)', action: 'Status Update', details: 'Automated escalation triggered for Alice Thompson.', target: 'EMP-001', time: '25 mins ago', category: 'Compliance', ip: 'N/A' },
  { id: 'LOG-8840', user: 'David Chen', action: 'Export Data', details: 'Downloaded "Departmental Risk Analysis" (XLSX).', target: 'REP-102', time: '1 hour ago', category: 'Security', ip: '192.168.1.15' },
  { id: 'LOG-8839', user: 'Alice Thompson', action: 'Assessment Sync', details: 'Self-assessment "Annual DSE" submitted successfully.', target: 'AS-2024-001', time: '3 hours ago', category: 'User Activity', ip: '10.0.0.124' },
  { id: 'LOG-8838', user: 'HR_MANAGER_NAME', action: 'Policy Upload', details: 'Added new document "Workplace Safety Policy 2024".', target: 'DOC-001', time: '5 hours ago', category: 'Documents', ip: '192.168.1.42' },
  { id: 'LOG-8837', user: 'Admin System', action: 'Permission Change', details: 'Revoked "Write" access for user Mark Spencer.', target: 'USR-992', time: '1 day ago', category: 'Security', ip: 'N/A' },
];

export default function AuditLogsPage() {
  const { fullName } = useProfile();
  const hrName = fullName || 'HR Manager';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">System Audit Trail</h2>
          <p className="text-[14px] text-slate-500 font-medium">Immutable record of all administrative actions, data changes, and system events for compliance verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Database className="w-4 h-4" />
            Integrity Check
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
            <Download className="w-4 h-4" />
            Download Audit Report
          </button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Security Status</span>
            </div>
            <h4 className="text-3xl font-black mb-2 tracking-tight">Secure</h4>
            <p className="text-slate-400 text-[13px] leading-relaxed">
              No unauthorized access attempts or suspicious configuration changes detected in the last <span className="text-emerald-400 font-bold">14 days</span>.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600/10 blur-3xl rounded-full" />
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Log Volume</span>
          </div>
          <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">124,842</h4>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Total recorded events since initialization. Average 250 logs/day.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Critical Actions</span>
          </div>
          <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">18</h4>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Sensitive configuration or permission changes requiring secondary audit.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by user, action, ID or details..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
            <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none">
              <option>All Categories</option>
              <option>Configuration</option>
              <option>Compliance</option>
              <option>Security</option>
              <option>User Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time / Category</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Target</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                        log.category === 'Security' ? "bg-rose-50 text-rose-600" :
                        log.category === 'Configuration' ? "bg-blue-50 text-blue-600" :
                        log.category === 'Compliance' ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {log.category === 'Security' ? <Lock className="w-5 h-5" /> :
                         log.category === 'Configuration' ? <Settings className="w-5 h-5" /> :
                         log.category === 'Compliance' ? <ClipboardList className="w-5 h-5" /> :
                         <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">{log.time}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">{log.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-700">{log.user === 'HR_MANAGER_NAME' ? hrName : log.user}</span>
                      <span className="text-[10px] text-slate-300 font-medium">• {log.ip}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[13px] text-slate-500 font-medium max-w-xs truncate">{log.details}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[12px] font-bold text-blue-600 font-mono">{log.target}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                      <ExternalLink className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
