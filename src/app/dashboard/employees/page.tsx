'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  MoreHorizontal,
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const employees = [
  { id: 'EMP-001', name: 'Alice Thompson', email: 'alice.t@techcorp.com', department: 'Operations', complianceScore: 98, status: 'Active', riskLevel: 'Low', lastAssessment: 'May 12, 2024' },
  { id: 'EMP-002', name: 'Bob Smith', email: 'b.smith@techcorp.com', department: 'Engineering', complianceScore: 72, status: 'Action Required', riskLevel: 'Medium', lastAssessment: 'Jan 15, 2024' },
  { id: 'EMP-003', name: 'Charlie Davis', email: 'charlie.d@techcorp.com', department: 'Marketing', complianceScore: 45, status: 'Overdue', riskLevel: 'High', lastAssessment: 'Oct 22, 2023' },
  { id: 'EMP-004', name: 'Diana Prince', email: 'diana.p@techcorp.com', department: 'Sales', complianceScore: 92, status: 'Active', riskLevel: 'Low', lastAssessment: 'Apr 05, 2024' },
  { id: 'EMP-005', name: 'Edward Norton', email: 'e.norton@techcorp.com', department: 'Engineering', complianceScore: 85, status: 'Active', riskLevel: 'Medium', lastAssessment: 'Mar 12, 2024' },
  { id: 'EMP-006', name: 'Fiona Gallagher', email: 'f.gallagher@techcorp.com', department: 'Operations', complianceScore: 10, status: 'Critical', riskLevel: 'High', lastAssessment: 'Never' },
  { id: 'EMP-007', name: 'George Miller', email: 'g.miller@techcorp.com', department: 'Legal', complianceScore: 100, status: 'Active', riskLevel: 'Low', lastAssessment: 'May 10, 2024' },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-[14px] text-slate-500 font-medium">Manage employee compliance profiles, risk levels, and assessment history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Employees</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">1,248</h4>
            <p className="text-[11px] text-emerald-500 font-bold mt-1">+24 this month</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliant</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">1,082</h4>
            <p className="text-[11px] text-slate-400 font-bold mt-1">86.7% Coverage</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">High Risk</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">42</h4>
            <p className="text-[11px] text-rose-500 font-bold mt-1">Action Required</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or department..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
            <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none">
              <option>Risk Level: All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900 leading-none">{employee.name}</h4>
                  <p className="text-[12px] text-slate-400 font-medium mt-1.5">{employee.id}</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">{employee.department}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight",
                  employee.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                  employee.status === 'Overdue' ? "bg-rose-50 text-rose-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {employee.status}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">Last: {employee.lastAssessment}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    employee.riskLevel === 'Low' ? "bg-emerald-500" :
                    employee.riskLevel === 'Medium' ? "bg-amber-500" :
                    "bg-rose-500"
                  )} />
                  <span className="text-[11px] font-bold text-slate-600">{employee.riskLevel} Risk</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliance Score</span>
                  <span className={cn(
                    "text-[13px] font-black",
                    employee.complianceScore > 80 ? "text-emerald-500" :
                    employee.complianceScore > 50 ? "text-amber-500" :
                    "text-rose-500"
                  )}>{employee.complianceScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      employee.complianceScore > 80 ? "bg-emerald-500" :
                      employee.complianceScore > 50 ? "bg-amber-500" :
                      "bg-rose-500"
                    )} 
                    style={{ width: `${employee.complianceScore}%` }} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  View Profile
                </button>
                <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
