'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const assessments = [
  { id: 'AS-2024-001', employee: 'Alice Thompson', department: 'Operations', status: 'Completed', dueDate: 'May 12, 2024', riskLevel: 'Low', completion: 100, reviewer: 'Sarah Johnson' },
  { id: 'AS-2024-002', employee: 'Bob Smith', department: 'Engineering', status: 'In Progress', dueDate: 'Jun 05, 2024', riskLevel: 'Medium', completion: 45, reviewer: 'David Chen' },
  { id: 'AS-2024-003', employee: 'Charlie Davis', department: 'Marketing', status: 'Overdue', dueDate: 'May 01, 2024', riskLevel: 'High', completion: 0, reviewer: 'Sarah Johnson' },
  { id: 'AS-2024-004', employee: 'Diana Prince', department: 'Sales', status: 'In Progress', dueDate: 'Jun 12, 2024', riskLevel: 'Low', completion: 80, reviewer: 'Emma Wilson' },
  { id: 'AS-2024-005', employee: 'Edward Norton', department: 'Engineering', status: 'Completed', dueDate: 'Apr 28, 2024', riskLevel: 'Medium', completion: 100, reviewer: 'David Chen' },
  { id: 'AS-2024-006', employee: 'Fiona Gallagher', department: 'Operations', status: 'Not Started', dueDate: 'Jul 15, 2024', riskLevel: 'Low', completion: 0, reviewer: 'Sarah Johnson' },
  { id: 'AS-2024-007', employee: 'George Miller', department: 'Legal', status: 'Completed', dueDate: 'May 10, 2024', riskLevel: 'Low', completion: 100, reviewer: 'Sarah Johnson' },
];

export default function AssessmentsPage() {
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
        <StatCard title="Total Assessments" value="1,428" trend="+12.5%" icon={ClipboardList} iconColor="bg-blue-50 text-blue-600" />
        <StatCard title="Completed" value="1,142" trend="+8.2%" icon={CheckCircle2} iconColor="bg-emerald-50 text-emerald-600" />
        <StatCard title="In Progress" value="194" trend="-2.4%" icon={Clock} iconColor="bg-amber-50 text-amber-600" />
        <StatCard title="Overdue" value="92" trend="+5.1%" icon={AlertCircle} iconColor="bg-rose-50 text-rose-600" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee, department, or ID..." 
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
              {assessments.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[12px] text-slate-500 font-medium">Showing 7 of 1,428 assessments</p>
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
