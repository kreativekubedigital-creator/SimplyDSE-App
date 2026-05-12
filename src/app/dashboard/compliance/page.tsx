'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const departmentData = [
  { name: 'Engineering', compliance: 88, risk: 12 },
  { name: 'Marketing', compliance: 65, risk: 35 },
  { name: 'Operations', compliance: 92, risk: 8 },
  { name: 'Sales', compliance: 78, risk: 22 },
  { name: 'HR', compliance: 96, risk: 4 },
  { name: 'Legal', compliance: 94, risk: 6 },
  { name: 'Finance', compliance: 82, risk: 18 },
];

const trendData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 72 },
  { month: 'Apr', score: 78 },
  { month: 'May', score: 85 },
  { month: 'Jun', score: 88 },
];

const riskDistribution = [
  { name: 'Low', value: 720, color: '#10b981' },
  { name: 'Medium', value: 340, color: '#f59e0b' },
  { name: 'High', value: 120, color: '#ef4444' },
  { name: 'Critical', value: 68, color: '#991b1b' },
];

export default function CompliancePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Compliance Analytics</h2>
          <p className="text-[14px] text-slate-500 font-medium">Real-time visibility into organization-wide compliance performance and health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ComplianceMetric 
          title="Global Compliance" 
          value="88.4%" 
          trend="+4.2%" 
          isPositive={true}
          icon={ShieldCheck}
          color="blue"
        />
        <ComplianceMetric 
          title="Assigned Target" 
          value="95.0%" 
          trend="-6.6%" 
          isPositive={false}
          icon={Target}
          color="indigo"
        />
        <ComplianceMetric 
          title="Growth Rate" 
          value="+12%" 
          trend="+2.1%" 
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <ComplianceMetric 
          title="At-Risk Units" 
          value="18" 
          trend="+2" 
          isPositive={false}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Trend */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Compliance Trend</h3>
              <p className="text-[13px] text-slate-400 font-medium">Organization score over the last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Avg Score</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Department Benchmarking</h3>
              <p className="text-[13px] text-slate-400 font-medium">Compliance performance by business unit</p>
            </div>
            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="compliance" 
                  fill="#2563eb" 
                  radius={[0, 4, 4, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Risk Distribution</h3>
          <p className="text-[13px] text-slate-400 font-medium mb-8">Current risk severity breakdown</p>
          <div className="h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">1,248</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-[12px] font-bold uppercase tracking-wider">Compliance Insight</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Improvement Opportunity</h3>
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-lg mb-8">
              The Engineering department shows a 12% increase in compliance after the latest ergonomic training module. 
              Implementing the same module for Marketing could resolve 65% of currently overdue assessments.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Estimated Impact</p>
                <h4 className="text-xl font-bold text-emerald-400 mt-1">+14.5% Overall</h4>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Risk Mitigation</p>
                <h4 className="text-xl font-bold text-blue-400 mt-1">-32 High Priority</h4>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-600/10 blur-[80px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ComplianceMetric({ title, value, trend, isPositive, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h4>
      </div>
    </div>
  );
}
