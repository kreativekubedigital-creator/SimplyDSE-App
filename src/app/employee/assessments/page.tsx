'use client';

import React, { useState } from 'react';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  ClipboardList, 
  LineChart, 
  BookOpen, 
  ChevronRight, 
  Monitor, 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Heart,
  FileText,
  Video,
  PlayCircle,
  ExternalLink,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'assessments' | 'analytics' | 'resources' || 'assessments';
  const [activeTab, setActiveTab] = useState<'assessments' | 'analytics' | 'resources'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const { assessments, stats, progressData, loading } = useEmployeeData();

  const tabs = [
    { id: 'assessments', label: 'My Assessments', icon: ClipboardList },
    { id: 'analytics', label: 'Health Analytics', icon: LineChart },
    { id: 'resources', label: 'Resource Library', icon: BookOpen },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage your workstation assessments, track health progress, and access ergonomic resources.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export My Data
          </button>
          <Link href="/employee/assessment" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95">
            <ClipboardList className="w-4 h-4" />
            Start New Assessment
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold transition-all",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'assessments' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Completion Rate" 
              value={`${stats.compliance}%`} 
              trend="Target: 100%" 
              isPositive={stats.compliance === 100}
              icon={CheckCircle2}
              iconColor="emerald"
            />
            <StatCard 
              title="Assessments" 
              value={stats.completedCount} 
              trend={`of ${stats.totalCount}`} 
              icon={ClipboardList}
              iconColor="blue"
            />
            <StatCard 
              title="Next Review" 
              value={stats.nextDue} 
              trend="Scheduled" 
              icon={Clock}
              iconColor="amber"
            />
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Assessment Records</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search records..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-64"
                  />
                </div>
                <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
                  <Filter className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Hydrating assessments...</p>
                </div>
              ) : assessments.length === 0 ? (
                <Link href="/employee/assessment" className="group relative p-12 rounded-[3rem] border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all block overflow-hidden text-center md:text-left">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full -mr-48 -mt-48 blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                      <Monitor className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-widest mb-4">
                        Action Required
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-3">DSE Hybrid Assessment</h4>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                        Your workstation health and safety review is pending. This assessment helps optimize your workspace for comfort and compliance.
                      </p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                      <div className="flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[14px] font-bold group-hover:bg-blue-600 transition-all shadow-xl group-hover:shadow-blue-600/20 group-hover:-translate-y-1">
                        Start Assessment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                assessments.map((item) => (
                  <div key={item.id} className="group relative p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        item.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {item.title.includes('DSE') ? <Monitor className="w-8 h-8" /> : <ClipboardList className="w-8 h-8" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-[16px] font-bold text-slate-900">{item.title}</h4>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight",
                            item.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium">{item.subtitle}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.dateLabel}</p>
                        <p className="text-[14px] font-bold text-slate-900 mt-1">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-2 pl-6 border-l border-slate-100">
                        {item.pdfUrl && (
                          <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all">
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                        {item.status === 'Completed' ? (
                          <a href={item.pdfUrl || '#'} target="_blank" rel="noreferrer" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95 inline-block">
                            View Report
                          </a>
                        ) : (
                          <Link href={`/employee/assessment?id=${item.id}`} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:scale-[1.05] shadow-lg shadow-blue-600/20 transition-all active:scale-95 inline-block">
                            {item.status === 'In Progress' ? 'Resume Assessment' : 'Take Assessment'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Health Score" value="84/100" trend="+4% this month" isPositive={true} icon={Heart} iconColor="rose" />
            <StatCard title="Posture Rating" value="Good" trend="Consistent" isPositive={true} icon={Monitor} iconColor="indigo" />
            <StatCard title="Break Adherence" value="92%" trend="On track" isPositive={true} icon={Clock} iconColor="emerald" />
            <StatCard title="Risk Level" value={stats.riskLevel} trend="Stable" icon={AlertCircle} iconColor="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Historical Progress</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Jan', score: 65, avg: 70 },
                    { month: 'Feb', score: 68, avg: 72 },
                    { month: 'Mar', score: 75, avg: 71 },
                    { month: 'Apr', score: 82, avg: 74 },
                    { month: 'May', score: 84, avg: 75 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="avg" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Category Breakdown</h3>
              <div className="space-y-6">
                {progressData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-700">{item.name}</span>
                      <span className="text-[12px] font-black text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white">
                <p className="text-[13px] font-bold leading-relaxed">
                  Your workspace setup is 84% optimal. Adjusting your monitor height could increase this to 95%.
                </p>
                <button className="mt-4 flex items-center gap-2 text-blue-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
                  View Recommendation <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Ergonomic Advice</h3>
              <p className="text-emerald-50/80 text-[14px] leading-relaxed mb-8">Expert guides on workstation setup, posture, and wellness exercises.</p>
              <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-emerald-900/20">
                Explore Guides
              </button>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">My Documents</h3>
              <p className="text-blue-50/80 text-[14px] leading-relaxed mb-8">Access your assessment reports, certificates, and personal health plans.</p>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                View My Files
              </button>
            </div>

            <div className="bg-purple-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Video Tutorials</h3>
              <p className="text-purple-50/80 text-[14px] leading-relaxed mb-8">Watch step-by-step videos on how to optimize your desk and equipment.</p>
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl text-[12px] font-bold hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-purple-900/20">
                Watch Videos
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Latest Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'The 20-20-20 Rule', cat: 'Posture', time: '5 min read', icon: PlayCircle },
                { title: 'Choosing the Right Chair', cat: 'Equipment', time: '8 min read', icon: FileText },
                { title: 'Wrist Support Guide', cat: 'Health', time: '3 min read', icon: Heart },
                { title: 'Monitor Height Setup', cat: 'Workstation', time: 'Video Guide', icon: Video },
              ].map((res) => (
                <div key={res.title} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <res.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900">{res.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{res.cat} • {res.time}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentHubPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}
