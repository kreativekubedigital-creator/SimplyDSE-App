'use client';

import React from 'react';
import { 
  ShieldCheck, 
  ClipboardList, 
  Clock, 
  Zap,
  ChevronRight,
  TrendingUp,
  Monitor,
  Heart,
  FileText,
  Video,
  LifeBuoy,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

const progressData = [
  { name: 'Assessments', value: 67, color: '#10B981' },
  { name: 'Ergonomics Training', value: 75, color: '#3B82F6' },
  { name: 'Recommendations', value: 50, color: '#8B5CF6' },
  { name: 'Follow-ups', value: 33, color: '#F59E0B' },
];

const mainAssessments = [
  { 
    id: '1', 
    title: 'Annual DSE Assessment 2024', 
    subtitle: 'Comprehensive workstation assessment', 
    status: 'Completed', 
    date: 'May 20, 2024', 
    dateLabel: 'Completed on',
    icon: Monitor,
    iconBg: 'bg-emerald-50 text-emerald-600'
  },
  { 
    id: '2', 
    title: 'Workstation Setup Review', 
    subtitle: 'Review your workstation setup', 
    status: 'In Progress', 
    progress: 60,
    date: 'Jun 15, 2024', 
    dateLabel: 'Due date',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-50 text-blue-600'
  },
  { 
    id: '3', 
    title: 'Follow-up Assessment', 
    subtitle: 'Follow-up on previous recommendations', 
    status: 'Not Started', 
    date: 'Jul 15, 2024', 
    dateLabel: 'Due date',
    icon: ClipboardList,
    iconBg: 'bg-purple-50 text-purple-600'
  },
];

import { LayoutDashboard } from 'lucide-react';

const upcomingTasks = [
  { title: 'Workstation Setup Review', date: 'Jun 15, 2024', due: 'Due in 5 days', priority: 'High Priority', priorityColor: 'text-rose-500' },
  { title: 'Ergonomics Training', date: 'Jun 22, 2024', due: 'Due in 12 days', priority: 'Medium Priority', priorityColor: 'text-amber-600' },
  { title: 'Follow-up Assessment', date: 'Jul 15, 2024', due: 'Due in 35 days', priority: 'Low Priority', priorityColor: 'text-emerald-500' },
];

const activities = [
  { text: 'Completed Annual DSE Assessment 2024', time: 'May 20, 2024 • 2:30 PM', icon: CheckCircle2, color: 'text-emerald-500' },
  { text: 'Started Workstation Setup Review', time: 'May 18, 2024 • 10:15 AM', icon: Calendar, color: 'text-blue-500' },
  { text: 'Uploaded workstation photo', time: 'May 18, 2024 • 10:10 AM', icon: FileText, color: 'text-purple-500' },
  { text: 'Completed ergonomics training module', time: 'May 15, 2024 • 4:45 PM', icon: Zap, color: 'text-amber-500' },
];

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <KPICard 
          title="Overall Compliance" 
          value="78%" 
          sub="Good"
          trend="+ 12%"
          isPositive={true}
          icon={ShieldCheck}
          iconColor="bg-blue-50 text-blue-600"
        />
        <KPICard 
          title="Assessments" 
          value="2 of 3" 
          sub="Done"
          icon={CheckCircle2}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <KPICard 
          title="Next Due" 
          value="Jun 15" 
          sub="5 days"
          icon={Clock}
          iconColor="bg-orange-50 text-orange-600"
        />
        <KPICard 
          title="Current Risk Level" 
          value="Low" 
          sub="No action"
          icon={TrendingUp}
          iconColor="bg-purple-50 text-purple-600"
        />
        <KPICard 
          title="Pending Tasks" 
          value="5" 
          sub="Tasks"
          icon={ClipboardList}
          iconColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
          {/* My Assessments */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[16px] font-semibold text-slate-900">My Assessments</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {mainAssessments.map((assessment) => (
                <div key={assessment.id} className="group relative p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", assessment.iconBg)}>
                      <assessment.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[14px] font-semibold text-slate-900 truncate">{assessment.title}</h4>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-lg text-[9px] font-semibold",
                          assessment.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                          assessment.status === 'In Progress' ? "bg-blue-50 text-blue-600" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {assessment.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium mb-3">{assessment.subtitle}</p>
                      {assessment.progress && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${assessment.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{assessment.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right pl-6 border-l border-slate-100 ml-4 hidden sm:block">
                      <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest">{assessment.dateLabel}</p>
                      <p className="text-[12px] font-semibold text-slate-900 mt-1">{assessment.date}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* My Progress */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[16px] font-semibold text-slate-900">My Progress</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View progress details</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: 67 }, { value: 33 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F1F5F9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-semibold text-slate-900">67%</p>
                    <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Overall Progress</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-8 space-y-6">
                {progressData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-slate-700">{item.name}</span>
                      <span className="text-[12px] font-semibold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-[12px] font-semibold text-blue-700 leading-relaxed">
                    Great progress! Complete your pending assessment to improve your workplace health.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Health Tips */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="flex-1 space-y-3">
                <h3 className="text-[16px] font-semibold text-white">Workplace Health Tips</h3>
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-white tracking-tight">Take regular breaks</h4>
                  <p className="text-slate-400 text-[14px] leading-relaxed max-w-md">
                    Stand up, stretch, and take a short walk every hour to reduce fatigue and improve focus. 
                    It helps maintain circulation and reduces muscle tension.
                  </p>
                </div>
                <button className="text-[13px] font-bold text-blue-400 hover:text-white flex items-center gap-2 transition-all pt-2 group/btn">
                  View more tips <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="w-64 h-64 shrink-0 relative">
                {/* Illustration Placeholder - Using a stylized representation */}
                <div className="w-full h-full bg-slate-800 rounded-[3rem] border border-slate-700 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                  <Heart className="w-20 h-20 text-blue-500 opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://ouch-cdn2.icons8.com/r_z_3_f_1_m_X_7_z_f_Z_G_z_v_o_y_X_u_s_Z_v_o_y_X_u_s.png" 
                      alt="Workplace Wellness" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[16px] font-semibold text-slate-900">Upcoming & Due Soon</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View calendar</button>
            </div>
            <div className="space-y-8">
              {upcomingTasks.map((task) => (
                <div key={task.title} className="flex items-start gap-5 group cursor-pointer">
                  <div className="w-12 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-white group-hover:border-blue-100 transition-all">
                    <Calendar className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{task.title}</p>
                      <p className="text-[11px] font-semibold text-slate-900">{task.date.split(',')[0]}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-700 font-medium">{task.due}</p>
                      <p className={cn("text-[9px] font-semibold uppercase tracking-widest", task.priorityColor)}>{task.priority}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[17px] font-bold text-slate-900">Recent Activity</h3>
              <button className="text-[12px] font-bold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-8">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100", activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-800 leading-snug">{activity.text}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Need Help? */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[17px] font-bold text-slate-900">Need Help?</h3>
              <button className="text-[12px] font-bold text-blue-600 hover:underline">View all resources</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Ergonomic Guide', sub: 'Best practices', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Video Tutorials', sub: 'Watch guides', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' },
                { title: 'Contact Support', sub: 'Get assistance', icon: LifeBuoy, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Report an Issue', sub: 'Let us know', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map((item) => (
                <button key={item.title} className="flex flex-col items-center text-center p-4 rounded-3xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/50 transition-all group">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm", item.bg, item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[12px] font-bold text-slate-900 leading-tight mb-1">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, sub, trend, isPositive, icon: Icon, iconColor, action }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <h4 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-tight">{value}</h4>
          {sub && <span className="text-[11px] font-medium text-slate-700 leading-tight">{sub}</span>}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[9px] font-bold mt-0.5",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            <TrendingUp className={cn("w-2.5 h-2.5", !isPositive && "rotate-180")} />
            {trend}
          </div>
        )}
      </div>
      {action && (
        <div className="absolute top-1.5 right-1.5 group-hover:scale-105 transition-transform">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-md shadow-lg shadow-blue-600/20">
            <action.icon className="w-2 h-2" />
            <span className="text-[7px] font-black uppercase leading-none">{action.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
