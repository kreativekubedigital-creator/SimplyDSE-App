'use client';

import React, { useState } from 'react';
import { useWorkforceData } from '@/hooks/useWorkforceData';
import { 
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  GraduationCap,
  PlayCircle,
  Award,
  BookOpen,
  TrendingUp,
  ChevronRight,
  MoreVertical,
  Plus,
  Download,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';

import { useSearchParams } from 'next/navigation';

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'directory' | 'training' || 'directory';
  const [activeTab, setActiveTab] = useState<'directory' | 'training'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const { employees, loading, stats } = useWorkforceData();

  const filteredEmployees = employees.filter((emp: any) => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workforce Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Centralized directory for Employee Lifecycle management, Training compliance, and DSE health data.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Headcount" 
          value={stats.total} 
          trend="+2.5%" 
          icon={Users}
          iconColor="blue"
        />
        <StatCard 
          title="Full Compliance" 
          value={stats.compliant} 
          trend="+12%" 
          icon={ShieldCheck}
          iconColor="emerald"
        />
        <StatCard 
          title="Training Active" 
          value={employees.filter(e => e.status === 'In Progress').length} 
          trend="82%" 
          icon={GraduationCap}
          iconColor="indigo"
        />
        <StatCard 
          title="Risk Escalations" 
          value={stats.highRisk} 
          trend={stats.highRisk > 0 ? "Action Required" : "Stable"} 
          isPositive={stats.highRisk === 0}
          icon={AlertTriangle}
          iconColor="rose"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('directory')}
          className={cn(
            "pb-4 text-[13px] font-bold transition-all relative",
            activeTab === 'directory' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          People Directory
          {activeTab === 'directory' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          className={cn(
            "pb-4 text-[13px] font-bold transition-all relative",
            activeTab === 'training' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Training Modules
          {activeTab === 'training' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-all">
              <Filter className="w-4 h-4" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-2" />
            <p className="text-[12px] text-slate-400 font-medium">Showing {filteredEmployees.length} of {employees.length} Members</p>
          </div>
        </div>

        {activeTab === 'directory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Member</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Assessment</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-[13px] text-slate-400 font-medium">Hydrating workforce records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-[13px]">No matching records found.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-500 border border-white shadow-sm">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-none">{emp.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                emp.complianceScore > 80 ? "bg-emerald-500" : emp.complianceScore > 50 ? "bg-amber-500" : "bg-rose-500"
                              )} 
                              style={{ width: `${emp.complianceScore}%` }} 
                            />
                          </div>
                          <span className="text-[12px] font-bold text-slate-700 w-8">{emp.complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                          emp.riskLevel === 'Low' ? "bg-emerald-50 text-emerald-600" : emp.riskLevel === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {emp.riskLevel}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[12px] font-bold text-slate-600">{emp.lastAssessment}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'DSE Fundamentals', duration: '45m', icon: PlayCircle, status: 'Active' },
                { title: 'Workplace Ergonomics', duration: '1h 20m', icon: BookOpen, status: 'Active' },
                { title: 'Safety Certification', duration: '30m', icon: Award, status: 'Mandatory' },
              ].map((course, idx) => (
                <div key={idx} className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl hover:border-blue-200 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <course.icon className="w-6 h-6" />
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-lg tracking-wider">
                      {course.status}
                    </span>
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">{course.title}</h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50">
                    <span className="text-[11px] text-slate-400 font-bold">{course.duration}</span>
                    <button className="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Manage Module <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
