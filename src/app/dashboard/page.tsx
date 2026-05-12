'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Users,
  ChevronRight,
  ExternalLink,
  FileText,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const trendData = [
  { name: 'May 12', rate: 65, benchmark: 60 },
  { name: 'May 19', rate: 68, benchmark: 61 },
  { name: 'May 26', rate: 72, benchmark: 62 },
  { name: 'Jun 2', rate: 70, benchmark: 61 },
  { name: 'Jun 9', rate: 76.4, benchmark: 63 },
];

const deptData = [
  { name: 'Finance', value: 92.1, color: '#10B981' },
  { name: 'IT', value: 86.7, color: '#10B981' },
  { name: 'Operations', value: 74.3, color: '#F59E0B' },
  { name: 'Sales', value: 68.2, color: '#F59E0B' },
  { name: 'Marketing', value: 61.5, color: '#EF4444' },
  { name: 'Warehouse', value: 48.7, color: '#EF4444' },
];

const distributionData = [
  { name: 'Compliant', value: 1248, color: '#10B981' },
  { name: 'In Progress', value: 312, color: '#F59E0B' },
  { name: 'Non-Compliant', value: 154, color: '#EF4444' },
  { name: 'Not Started', value: 24, color: '#94A3B8' },
];

const employees = [
  { id: '1', name: 'Michael Brown', dept: 'Operations', issue: 'Assessment Overdue', dueDate: 'May 28, 2024', delay: '15 days', risk: 'high' },
  { id: '2', name: 'Amanda Kelly', dept: 'Sales', issue: 'Non-Compliant Results', dueDate: 'May 30, 2024', delay: '13 days', risk: 'high' },
  { id: '3', name: 'James Davis', dept: 'Marketing', issue: 'Follow-up Required', dueDate: 'Jun 1, 2024', delay: '11 days', risk: 'medium' },
  { id: '4', name: 'Lisa Wong', dept: 'IT', issue: 'Assessment Overdue', dueDate: 'Jun 2, 2024', delay: '10 days', risk: 'medium' },
  { id: '5', name: 'Robert Taylor', dept: 'Warehouse', issue: 'Non-Compliant Results', dueDate: 'Jun 3, 2024', delay: '9 days', risk: 'high' },
];

const tasks = [
  { date: 'JUN 14', title: 'Ergonomic Assessment', subtitle: '32 employees', status: 'Overdue' },
  { date: 'JUN 16', title: 'Workstation Review', subtitle: '18 employees', status: 'Due Soon' },
  { date: 'JUN 20', title: 'Follow-up Assessment', subtitle: '45 employees', status: 'Upcoming' },
];

const activity = [
  { text: 'Ergonomic assessment completed for Sarah Wilson', time: '2 min ago', icon: CheckCircle2, color: 'text-emerald-500' },
  { text: 'John Smith\'s follow-up assessment is now overdue', time: '15 min ago', icon: AlertCircle, color: 'text-rose-500' },
  { text: 'New risk assessment identified for Marketing team', time: '1 hour ago', icon: AlertTriangle, color: 'text-amber-500' },
  { text: 'Compliance report generated for May 2024', time: '2 hours ago', icon: FileText, color: 'text-blue-500' },
];

export default function ComplianceOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Compliance Overview</h1>
          <p className="text-[12px] text-slate-700 mt-1 font-medium">Monitor compliance status and ensure a safe, healthy workplace.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            May 12 - Jun 12, 2024
            <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-500" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-900 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            Filters
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <KPICard 
          title="Overall Compliance" 
          value="76.4%" 
          trend="+ 6.3%" 
          isPositive={true}
          icon={ShieldCheck}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <KPICard 
          title="Completed Assessments" 
          value="1,248" 
          trend="+ 8.7%" 
          isPositive={true}
          icon={ClipboardList}
          iconColor="bg-amber-50 text-amber-600"
        />
        <KPICard 
          title="Non-Compliant" 
          value="154" 
          trend="- 5.2%" 
          isPositive={false}
          icon={AlertCircle}
          iconColor="bg-rose-50 text-rose-600"
        />
        <KPICard 
          title="Pending Assessments" 
          value="312" 
          trend="- 2.1%" 
          isPositive={false}
          icon={Clock}
          iconColor="bg-purple-50 text-purple-600"
        />
        <KPICard 
          title="At Risk Employees" 
          value="87" 
          trend="- 3.4%" 
          isPositive={false}
          icon={Users}
          iconColor="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Charts Row row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-semibold text-slate-900">Compliance Trend</h3>
            <select className="bg-slate-50 border-none text-[10px] font-semibold text-slate-700 focus:ring-0 cursor-pointer rounded-lg px-2 py-1">
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 500, fill: '#475569' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 500, fill: '#475569' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#3B82F6', strokeWidth: 1.5, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#94A3B8" 
                  strokeWidth={1.5} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-semibold text-slate-700">Compliance Rate (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-[10px] font-semibold text-slate-700">Industry Benchmark (%)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-semibold text-slate-900">Compliance by Department</h3>
            <button className="text-[10px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-5">
            {deptData.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-slate-900">{dept.value}%</span>
                </div>
                <div className="h-1.25 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${dept.value}%`, backgroundColor: dept.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-8">Compliance Status Distribution</h3>
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[20px] font-bold text-slate-900">1,638</p>
              <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Total Employees</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-900 leading-none">{item.name}</p>
                  <p className="text-[10px] text-slate-700 font-medium mt-1">{item.value} ({Math.round(item.value / 16.38)}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights Row - Three columns side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Overview */}
        <div className="bg-white border border-slate-200 rounded-[1.25rem] p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-4">Risk Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'High Risk', count: 23, color: 'text-rose-500', icon: AlertCircle },
              { label: 'Medium Risk', count: 64, color: 'text-amber-500', icon: AlertTriangle },
              { label: 'Low Risk', count: 127, color: 'text-emerald-500', icon: CheckCircle2 },
              { label: 'No Risk', count: 1424, color: 'text-slate-600', icon: ShieldCheck },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-slate-50 transition-all">
                <div className="flex items-center gap-2.5">
                  <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                  <span className="text-[12px] font-medium text-slate-800">{item.label}</span>
                </div>
                <span className="text-[12px] font-semibold text-slate-900">{item.count} <span className="text-[10px] text-slate-700 font-medium">emp</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-slate-200 rounded-[1.25rem] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-900">Compliance Tasks</h3>
            <button className="text-[10px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.title} className="flex items-start gap-3 group">
                <div className="w-10 h-12 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter">{task.date.split(' ')[0]}</span>
                  <span className="text-[14px] font-bold text-slate-900 leading-none">{task.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{task.title}</p>
                  <p className="text-[10px] text-slate-700 font-medium mt-0.5">{task.subtitle}</p>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-tight shrink-0",
                  task.status === 'Overdue' ? "bg-rose-50 text-rose-500" :
                  task.status === 'Due Soon' ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-[1.25rem] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-[10px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 shadow-sm", item.color)}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-800 leading-tight line-clamp-2">{item.text}</p>
                  <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Section - Full Width */}
      <div className="w-full bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-semibold text-slate-900">Employees Requiring Attention</h3>
            <button className="text-[10px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-50 rounded-xl w-max">
            <button className="px-5 py-2 bg-white text-blue-600 shadow-sm border border-slate-200 rounded-lg text-[11px] font-semibold whitespace-nowrap">Non-Compliant (154)</button>
            <button className="px-5 py-2 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap">Overdue (96)</button>
            <button className="px-5 py-2 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap">Due Soon (216)</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Issue</th>
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Days Overdue</th>
                <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-700 uppercase">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[12px] font-semibold text-slate-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[12px] font-medium text-slate-800">{emp.dept}</td>
                  <td className="px-8 py-4 text-[12px] font-medium text-slate-800">{emp.issue}</td>
                  <td className="px-8 py-4 text-[12px] font-medium text-slate-800">{emp.dueDate}</td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-semibold text-rose-600">{emp.delay}</span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all">View</button>
                      <button className="p-1.5 text-slate-500 hover:text-slate-800"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">Showing 1 to 5 of 154 results</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-[10px] font-semibold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 hover:bg-slate-50 transition-all">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 hover:bg-slate-50 transition-all">3</button>
            <span className="text-slate-400 text-[10px]">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 hover:bg-slate-50 transition-all">31</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-800 hover:bg-slate-50 transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon, iconColor }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform duration-700" />
      <div className="flex items-start justify-between relative z-10">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-sm", iconColor)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter",
          isPositive ? "text-emerald-600" : "text-rose-600"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</p>
          <div className="h-8 w-20 opacity-40">
            {/* Simple sparkline mock */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.map(d => ({ v: Math.random() }))}>
                <Line type="monotone" dataKey="v" stroke={isPositive ? '#10B981' : '#EF4444'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
