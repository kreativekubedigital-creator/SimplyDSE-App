'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  User,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  useEffect(() => {
    async function fetchAssessments() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        const { data: records, error } = await supabase
          .from('assessments')
          .select(`
            *,
            profiles(full_name, email)
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const processedRecords = records.map((rec: any) => ({
          id: rec.id.substring(0, 12).toUpperCase(),
          employee: rec.profiles?.full_name || rec.profiles?.email || 'Unnamed',
          department: 'General',
          status: rec.status === 'completed' ? 'Completed' : rec.status === 'in_progress' ? 'In Progress' : 'Pending',
          dueDate: rec.completed_at ? new Date(rec.completed_at).toLocaleDateString() : 'Pending',
          riskLevel: rec.risk_level === 'high' ? 'High' : rec.risk_level === 'medium' ? 'Medium' : 'Low',
          completion: rec.status === 'completed' ? 100 : rec.status === 'in_progress' ? 50 : 0,
          reviewer: 'System'
        }));

        setAssessments(processedRecords);

        setStats({
          total: processedRecords.length,
          completed: processedRecords.filter((r: any) => r.status === 'Completed').length,
          inProgress: processedRecords.filter((r: any) => r.status === 'In Progress').length,
          overdue: 0 // Logic for overdue would depend on a due_date column
        });

      } catch (err) {
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []);

  const filteredAssessments = assessments.filter((item: any) => 
    item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Assessment Management</h2>
          <p className="text-[14px] text-slate-500 font-medium">Track, manage, and review Organisation-wide DSE assessments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Assessments" value={stats.total.toString()} trend="Live" icon={ClipboardList} iconColor="bg-blue-50 text-blue-600" />
        <StatCard title="Completed" value={stats.completed.toString()} trend="Success" icon={CheckCircle2} iconColor="bg-emerald-50 text-emerald-600" />
        <StatCard title="In Progress" value={stats.inProgress.toString()} trend="Pending" icon={Clock} iconColor="bg-amber-50 text-amber-600" />
        <StatCard title="Overdue" value={stats.overdue.toString()} trend="Warning" icon={AlertCircle} iconColor="bg-rose-50 text-rose-600" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee, department, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none">
            <option>All Departments</option>
            <option>Operations</option>
            <option>Engineering</option>
            <option>Marketing</option>
          </select>
          <select className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Overdue</option>
          </select>
          <button className="p-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID / Employee</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Completion</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Loading assessments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">No assessments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 leading-none">{item.employee}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-semibold text-slate-600">{item.department}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                        item.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                        item.status === 'In Progress' ? "bg-blue-50 text-blue-600" :
                        item.status === 'Overdue' ? "bg-rose-50 text-rose-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-semibold text-slate-900">{item.dueDate}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.riskLevel === 'Low' ? "bg-emerald-500" :
                          item.riskLevel === 'Medium' ? "bg-amber-500" :
                          "bg-rose-500"
                        )} />
                        <span className="text-[13px] font-bold text-slate-700">{item.riskLevel}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              item.completion === 100 ? "bg-emerald-500" : "bg-blue-500"
                            )} 
                            style={{ width: `${item.completion}%` }} 
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{item.completion}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[12px] text-slate-500 font-medium">Showing {filteredAssessments.length} assessments</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[12px] font-bold text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[12px] font-bold text-slate-900 hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, iconColor }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={cn(
          "text-[11px] font-bold px-2 py-0.5 rounded-lg",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}
