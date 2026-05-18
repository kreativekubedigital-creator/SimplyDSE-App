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
  const tabParam = searchParams.get('tab');
  const initialTab = (['assigned', 'history', 'analytics', 'resources'].includes(tabParam || '')
    ? tabParam
    : 'assigned') as 'assigned' | 'history' | 'analytics' | 'resources';
  const [activeTab, setActiveTab] = useState<'assigned' | 'history' | 'analytics' | 'resources'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const { assessments, assignments, stats, analytics, loading, exportData } = useEmployeeData();

  const tabs = [
    { id: 'assigned', label: 'Assigned Assessments', icon: ClipboardList },
    { id: 'history', label: 'My History', icon: Clock },
    { id: 'analytics', label: 'Health Analytics', icon: LineChart },
    { id: 'resources', label: 'Resource Library', icon: BookOpen },
  ];

  const pendingAssignment = assignments.find(a => a.status !== 'completed');
  const startActionUrl = pendingAssignment 
    ? `/employee/assessment?id=${pendingAssignment.submissionId || ''}`
    : '/employee/assessment';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage your workstation assessments, track health progress, and access ergonomic resources.</p>
        </div>
        
        {/* Buttons removed per user request */}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-medium transition-all",
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
      {activeTab === 'assigned' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Assigned Tasks" 
              value={assignments.filter(a => a.status !== 'completed').length} 
              trend="Pending Completion" 
              isPositive={assignments.filter(a => a.status !== 'completed').length === 0}
              icon={AlertCircle}
              iconColor="blue"
            />
            <StatCard 
              title="Next Deadline" 
              value={stats.nextDue} 
              trend="Action Required" 
              icon={Clock}
              iconColor="amber"
            />
            <StatCard 
              title="Compliance Status" 
              value={stats.compliance === 100 ? 'Compliant' : 'Review Needed'} 
              trend={`${stats.compliance}% Rate`} 
              isPositive={stats.compliance === 100}
              icon={CheckCircle2}
              iconColor="emerald"
            />
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-widest">Pending Assignments</h3>
                <p className="text-[10px] text-slate-400 mt-1">HR-assigned assessments requiring your attention</p>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Fetching assignments...</p>
                </div>
              ) : assignments.filter(a => a.status !== 'completed').length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">All Caught Up!</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">You have no pending HR-assigned assessments at this time.</p>
                </div>
              ) : (
                assignments.filter(a => a.status !== 'completed').map((item) => (
                  <div key={item.id} className="group relative p-8 rounded-[2.5rem] border-2 border-blue-100 bg-blue-50/20 hover:bg-blue-50/50 transition-all overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20">
                        <Monitor className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-widest">
                            {item.status === 'in_progress' ? 'In Progress' : 'New Assignment'}
                          </span>
                          <span className="text-[10px] text-slate-400">Assigned on {item.assignedAt}</span>
                        </div>
                        <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed max-w-xl">
                          {item.description || 'This assessment has been assigned to you by your HR manager to ensure your workstation is properly set up.'}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
                            <Clock className="w-4 h-4" />
                            Due: {item.dueDate}
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <div className="text-[11px] text-slate-400 uppercase tracking-widest">
                            Version {item.version}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 w-full md:w-auto">
                        <Link 
                          href={`/employee/assessment?id=${item.submissionId || ''}`}
                          className="flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[13px] font-medium hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1"
                        >
                          {item.status === 'in_progress' ? 'Continue Assessment' : 'Start Assessment'} 
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
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
              title="Total Completed" 
              value={stats.completedCount} 
              trend="Lifetime Records" 
              icon={ClipboardList}
              iconColor="blue"
            />
            <StatCard 
              title="Last Assessment" 
              value={assessments[0]?.date || 'N/A'} 
              trend="Completed" 
              icon={Clock}
              iconColor="indigo"
            />
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-widest">Assessment History</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Hydrating history...</p>
                </div>
              ) : assessments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <p className="text-sm font-medium text-slate-500">No completed assessments found.</p>
                </div>
              ) : (
                assessments.filter(item => 
                  item.title.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item) => (
                  <div key={item.id} className="group relative p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        "bg-emerald-50 text-emerald-600"
                      )}>
                        {item.title.includes('DSE') ? <Monitor className="w-8 h-8" /> : <ClipboardList className="w-8 h-8" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-[14px] font-semibold text-slate-900">{item.title}</h4>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight",
                            "bg-emerald-100 text-emerald-700"
                          )}>
                            {item.status}
                          </span>
                          {item.emailStatus === 'sent' && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                              <CheckCircle2 className="w-3 h-3" />
                              Email Sent
                            </span>
                          )}
                          {item.emailStatus === 'failed' && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                              <AlertCircle className="w-3 h-3" />
                              Email Failed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{item.dateLabel}</p>
                        <p className="text-[13px] font-bold text-slate-900 mt-1">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-2 pl-6 border-l border-slate-100">
                        {item.pdfUrl && (
                          <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all">
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                        <Link 
                          href={`/employee/reports/${item.id}`}
                          className={cn(
                            "px-6 py-3 text-white rounded-xl text-[11px] font-medium hover:scale-[1.05] transition-all active:scale-95 inline-block shadow-lg",
                            item.pdfUrl ? "bg-slate-900 shadow-slate-900/10" : "bg-blue-600 shadow-blue-600/20"
                          )}
                        >
                          {item.pdfUrl ? 'View Report' : 'Generate Report'}
                        </Link>
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
            <StatCard 
              title="Health Score" 
              value={`${analytics.healthScore}/100`} 
              trend={analytics.healthTrend} 
              isPositive={analytics.isPositiveTrend} 
              icon={Heart} 
              iconColor="rose" 
            />
            <StatCard 
              title="Posture Rating" 
              value={analytics.postureRating} 
              trend="Consistent" 
              isPositive={true} 
              icon={Monitor} 
              iconColor="indigo" 
            />
            <StatCard 
              title="Break Adherence" 
              value={analytics.breakAdherence} 
              trend="On track" 
              isPositive={true} 
              icon={Clock} 
              iconColor="emerald" 
            />
            <StatCard 
              title="Risk Level" 
              value={stats.riskLevel} 
              trend="Stable" 
              icon={AlertCircle} 
              iconColor="amber" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-widest mb-8">Historical Progress</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.historicalData.length > 0 ? analytics.historicalData : [
                    { month: 'Jan', score: 0, avg: 70 },
                    { month: 'Feb', score: 0, avg: 72 },
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
              <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest mb-8">Category Breakdown</h3>
              <div className="space-y-6">
                {analytics.categoryBreakdown.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-700">{item.name}</span>
                      <span className="text-[11px] font-semibold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white">
                <p className="text-[12px] font-medium leading-relaxed text-slate-100">
                  Your workspace setup is {analytics.healthScore}% optimal. {analytics.healthScore < 90 ? 'Review your high-risk areas to improve your score.' : 'Great work! Your workstation is highly optimized.'}
                </p>
                <button className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
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
              <h3 className="text-xl font-bold mb-4 tracking-tight">Ergonomic Advice</h3>
              <p className="text-emerald-50/80 text-[13px] leading-relaxed mb-8">Expert guides on workstation setup, posture, and wellness exercises.</p>
              <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl text-[11px] font-medium hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-emerald-900/20">
                Explore Guides
              </button>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight">My Documents</h3>
              <p className="text-blue-50/80 text-[13px] leading-relaxed mb-8">Access your assessment reports, certificates, and personal health plans.</p>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[11px] font-medium hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                View My Files
              </button>
            </div>

            <div className="bg-purple-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-4 tracking-tight">Video Tutorials</h3>
              <p className="text-purple-50/80 text-[13px] leading-relaxed mb-8">Watch step-by-step videos on how to optimize your desk and equipment.</p>
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl text-[11px] font-medium hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-purple-900/20">
                Watch Videos
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[11px] font-medium text-slate-900 uppercase tracking-widest mb-8">Latest Resources</h3>
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
                      <h4 className="text-[12px] font-semibold text-slate-900">{res.title}</h4>
                      <p className="text-[10px] text-slate-500">{res.cat} • {res.time}</p>
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
