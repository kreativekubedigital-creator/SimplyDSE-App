'use client';

import React from 'react';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { 
  ShieldCheck, 
  ClipboardList, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Monitor, 
  Heart, 
  CheckCircle2, 
  Calendar, 
  MessageSquare,
  Loader2,
  FileText,
  Video,
  LifeBuoy,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const { loading: employeeLoading, assessments, stats, progressData, activities, upcomingTasks } = useEmployeeData();
  const { fullName, authMethod, organizationName, loading: profileLoading } = useProfile();
  const loading = employeeLoading || profileLoading;
  const firstName = fullName?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Hydrating Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full inline-block">
              Health & Wellness Status
            </span>
            {authMethod !== 'email' && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-emerald-500/10">
                <ShieldCheck className="w-3 h-3" />
                Logged in via {organizationName} SSO
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-[13px] text-slate-500 mt-2 font-medium">Your workplace ergonomics and wellness overview is ready.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/employee/assessments?tab=assessments" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20">
            <ClipboardList className="w-4 h-4" />
            My Assessments
          </Link>
        </div>
      </div>

      {/* KPI Row with Deep Linking */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link href="/employee/assessments?tab=analytics">
          <StatCard 
            title="Compliance" 
            value={`${stats.compliance}%`} 
            trend={stats.compliance > 80 ? "On Track" : "Needs Action"} 
            isPositive={stats.compliance > 80}
            icon={ShieldCheck}
            iconColor="blue"
          />
        </Link>
        <Link href="/employee/assessments?tab=assessments">
          <StatCard 
            title="Assessments" 
            value={stats.completedCount} 
            trend={`of ${stats.totalCount}`} 
            icon={CheckCircle2}
            iconColor="emerald"
          />
        </Link>
        <Link href="/employee/assessments?tab=analytics">
          <StatCard 
            title="Next Due" 
            value={stats.nextDue} 
            trend="Scheduled" 
            icon={Clock}
            iconColor="amber"
          />
        </Link>
        <Link href="/employee/assessments?tab=analytics">
          <StatCard 
            title="Risk Level" 
            value={stats.riskLevel} 
            trend="Stable" 
            icon={TrendingUp}
            iconColor="purple"
          />
        </Link>
        <Link href="/employee/assessments?tab=assessments">
          <StatCard 
            title="Pending" 
            value={stats.pendingTasks} 
            trend="Tasks" 
            isPositive={stats.pendingTasks === 0}
            icon={ClipboardList}
            iconColor="rose"
          />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Assessment Hub Summary */}
          <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Active Assessments</h3>
              <Link href="/employee/assessments?tab=assessments" className="text-[11px] font-bold text-blue-600 hover:underline">View Assessment Hub</Link>
            </div>
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <Link href="/employee/assessment" className="group relative p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all block overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                      <Monitor className="w-10 h-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider mb-3">
                        Required
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">DSE Hybrid Assessment</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">Your workstation assessment is ready. Complete this to ensure your hybrid setup meets health and safety standards.</p>
                    </div>
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold group-hover:bg-blue-600 transition-all shadow-lg group-hover:shadow-blue-600/20">
                        Start Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                assessments.slice(0, 3).map((assessment) => (
                  <Link 
                    href={assessment.status === 'Completed' ? `/employee/reports/${assessment.id}` : `/employee/assessment?id=${assessment.id}`}
                    key={assessment.id} 
                    className="group relative p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer block"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        assessment.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {assessment.title.includes('DSE') ? <Monitor className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-[15px] font-bold text-slate-900">{assessment.title}</h4>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight",
                            assessment.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {assessment.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mb-3 truncate">{assessment.subtitle}</p>
                        {assessment.progress > 0 && assessment.status !== 'Completed' && (
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${assessment.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400">{assessment.progress}%</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors ml-4" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Health Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Performance Mix</h3>
                <div className="h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: stats.compliance }, { value: 100 - stats.compliance }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.compliance}%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Health Index</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {progressData.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase tracking-tight">{item.name}</span>
                        <span className="text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
             </section>

             <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-600/20 transition-all duration-700" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">Ergonomic Tip</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed mb-8 flex-1">
                    Take regular breaks! Stand up, stretch, and take a short walk every hour to reduce fatigue and improve focus.
                  </p>
                  <Link href="/employee/wellness?tab=resources" className="flex items-center gap-2 text-blue-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors group/link">
                    Explore Wellness Library <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
             </section>
          </div>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions / Communication Hub */}
          <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Communications</h3>
            <div className="space-y-4">
              <Link href="/employee/communication?tab=messages" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-blue-100 hover:bg-slate-50 transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-900">Unread Messages</p>
                  <p className="text-[11px] text-slate-400 font-medium">2 from Admin Support</p>
                </div>
                <span className="w-5 h-5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-lg">2</span>
              </Link>

              <Link href="/employee/communication?tab=notifications" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-emerald-100 hover:bg-slate-50 transition-all group">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-900">Notifications</p>
                  <p className="text-[11px] text-slate-400 font-medium">3 alerts today</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
               <Link href="/employee/communication?tab=support" className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                  <LifeBuoy className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-900">Get Help</span>
               </Link>
               <Link href="/employee/wellness?tab=resources" className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-900">Documents</span>
               </Link>
            </div>
          </section>

          {/* Recent Timeline */}
          <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Recent Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm",
                    activity.type === 'success' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                  )}>
                    {activity.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-[13px] font-bold text-slate-800 leading-snug">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
