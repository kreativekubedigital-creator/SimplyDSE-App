'use client';

import React from 'react';
import { 
  GraduationCap, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  MoreHorizontal,
  BookOpen,
  Users,
  Video,
  FileText,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const trainingModules = [
  { id: 'TRN-001', name: 'Foundational DSE Awareness', category: 'Compliance', duration: '45 mins', assigned: 1248, completed: 1142, status: 'Active' },
  { id: 'TRN-002', name: 'Ergonomic Equipment Setup', category: 'Practical', duration: '30 mins', assigned: 842, completed: 780, status: 'Active' },
  { id: 'TRN-003', name: 'Workplace Wellness & Mobility', category: 'Wellness', duration: '20 mins', assigned: 1248, completed: 956, status: 'Active' },
  { id: 'TRN-004', name: 'Advanced Risk Assessment for Leads', category: 'Specialized', duration: '60 mins', assigned: 124, completed: 92, status: 'Active' },
  { id: 'TRN-005', name: 'Legal Compliance Briefing 2024', category: 'Legal', duration: '15 mins', assigned: 1248, completed: 1248, status: 'Archived' },
];

export default function TrainingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Workplace Training</h2>
          <p className="text-[14px] text-slate-500 font-medium">Manage educational modules, ergonomic guidance, and employee certification progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Award className="w-4 h-4" />
            Certificates
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Global Completion" value="89.2%" trend="+3.4%" icon={CheckCircle2} iconColor="bg-emerald-50 text-emerald-600" />
        <StatCard title="Active Learners" value="156" trend="+12" icon={Users} iconColor="bg-blue-50 text-blue-600" />
        <StatCard title="Hours Logged" value="428h" trend="+45h" icon={Clock} iconColor="bg-amber-50 text-amber-600" />
        <StatCard title="Certs Issued" value="1,042" trend="+18" icon={Award} iconColor="bg-indigo-50 text-indigo-600" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Module List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Training Modules</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search modules..." 
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {trainingModules.map((module) => (
              <div key={module.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{module.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase tracking-tight text-slate-500">{module.category}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {module.duration}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <Users className="w-3.5 h-3.5" />
                          {module.assigned} Assigned
                        </span>
                      </div>
                      
                      <div className="mt-4 w-64">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                          <span className="text-[11px] font-bold text-slate-900">{Math.round((module.completed / module.assigned) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(module.completed / module.assigned) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      <PlayCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Insights */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Training Insights</h3>
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Compliance Correlation</h4>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-8">
                Teams that completed the "Equipment Setup" module showed a <span className="text-emerald-400 font-bold">32% reduction</span> in ergonomic risk escalations.
              </p>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-[13px] font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                View Impact Report
              </button>
            </div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-600/10 blur-[80px] rounded-full" />
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h4 className="text-[15px] font-bold text-slate-900 mb-6">Recent Certifications</h4>
            <div className="space-y-4">
              <CertItem name="Alice Thompson" cert="DSE Professional" date="Today" />
              <CertItem name="Sarah Johnson" cert="Health & Safety Lead" date="Yesterday" />
              <CertItem name="Bob Smith" cert="Foundational DSE" date="2 days ago" />
              <CertItem name="Edward Norton" cert="Foundational DSE" date="3 days ago" />
            </div>
            <button className="w-full mt-8 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-bold rounded-xl transition-all">
              View All Certificates
            </button>
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
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">
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

function CertItem({ name, cert, date }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center">
          <Award className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-900 leading-none">{name}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">{cert}</p>
        </div>
      </div>
      <span className="text-[11px] font-bold text-slate-300">{date}</span>
    </div>
  );
}
