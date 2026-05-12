'use client';

import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Mail, 
  Clock, 
  Plus, 
  MoreHorizontal,
  FileSpreadsheet,
  FileJson,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const recentReports = [
  { id: 'REP-101', name: 'Quarterly Compliance Audit', type: 'PDF', date: 'May 10, 2024', size: '2.4 MB', author: 'Sarah Johnson' },
  { id: 'REP-102', name: 'Departmental Risk Analysis', type: 'Excel', date: 'May 08, 2024', size: '1.1 MB', author: 'David Chen' },
  { id: 'REP-103', name: 'Employee Assessment History', type: 'CSV', date: 'May 05, 2024', size: '840 KB', author: 'Sarah Johnson' },
  { id: 'REP-104', name: 'Ergonomic Equipment Budget', type: 'PDF', date: 'Apr 28, 2024', size: '4.2 MB', author: 'Finance Team' },
  { id: 'REP-105', name: 'Annual Safety Overview', type: 'PDF', date: 'Jan 15, 2024', size: '12.8 MB', author: 'System Auto-Gen' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Reporting Center</h2>
          <p className="text-[14px] text-slate-500 font-medium">Generate, export, and schedule Organisation-wide compliance and safety reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Clock className="w-4 h-4" />
            Scheduled Reports
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            Create Report
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCategory 
          title="Compliance Progress" 
          desc="Overall Organisation compliance scores and departmental trends."
          icon={BarChart3}
          color="blue"
        />
        <ReportCategory 
          title="Risk & Safety" 
          desc="High-priority ergonomic risks and incident resolution tracking."
          icon={TrendingUp}
          color="rose"
        />
        <ReportCategory 
          title="Employee Data" 
          desc="Detailed assessment histories and individual compliance profiles."
          icon={FileText}
          color="emerald"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Reports List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recently Generated</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {recentReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      report.type === 'PDF' ? "bg-rose-50 text-rose-600" :
                      report.type === 'Excel' ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {report.type === 'PDF' ? <FileText className="w-6 h-6" /> : 
                       report.type === 'Excel' ? <FileSpreadsheet className="w-6 h-6" /> : 
                       <FileJson className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{report.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{report.id}</span>
                        <span className="text-[11px] text-slate-300 font-medium">•</span>
                        <span className="text-[11px] text-slate-400 font-bold">{report.date}</span>
                        <span className="text-[11px] text-slate-300 font-medium">•</span>
                        <span className="text-[11px] text-slate-400 font-bold">{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                      <Download className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2.5 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
              <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 group">
                View Report Archive
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Reports Sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Automated Delivery</h3>
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Executive Summary</h4>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-8">
                Your monthly Organisation-wide compliance rollup is scheduled for delivery.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Frequency</span>
                  <span className="font-bold">Monthly (1st)</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Recipients</span>
                  <span className="font-bold">4 Stakeholders</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Next Delivery</span>
                  <span className="font-bold text-emerald-400">June 01, 2024</span>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-[13px] font-bold rounded-xl transition-all">
                Manage Schedule
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[15px] font-bold text-slate-900">Custom Export</h4>
              <BarChart3 className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-4">
              <p className="text-[12px] text-slate-500 font-medium">Quickly pull raw data for external analysis.</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase">CSV</span>
                </button>
                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all flex flex-col items-center gap-2">
                  <FileJson className="w-6 h-6 text-blue-600" />
                  <span className="text-[10px] font-black uppercase">JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCategory({ title, desc, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
  };

  return (
    <button className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group text-left">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
      <p className="text-[12px] text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
    </button>
  );
}
