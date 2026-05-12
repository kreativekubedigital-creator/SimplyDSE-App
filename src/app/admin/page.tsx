'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/admin/StatCard';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  PlusCircle,
  MoreHorizontal,
  Bell,
  Activity,
  Server,
  Search,
  Shield,
  Ticket,
  TrendingUp,
  Monitor,
  CheckCircle2,
  Zap,
  Globe,
  Clock,
  LayoutDashboard,
  ShieldAlert,
  HardDrive,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Types for our data
interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  region: string;
  created_at: string;
}

interface InfraMetric {
  id: string;
  name: string;
  status: string;
  health_score: number;
}

export default function AdminOverviewPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [infraMetrics, setInfraMetrics] = useState<InfraMetric[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [complianceRate, setComplianceRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, logsRes, infraRes, orgsRes] = await Promise.all([
          supabase.from('global_dashboard_stats').select('*').single(),
          supabase.from('audit_logs').select(`
            *,
            profiles ( full_name ),
            organizations ( name )
          `).order('created_at', { ascending: false }).limit(5),
          supabase.from('infrastructure_metrics').select('*').order('name', { ascending: true }),
          supabase.from('organizations').select('*').order('created_at', { ascending: false })
        ]);

        if (statsRes.data) {
          setComplianceRate(statsRes.data.latest_compliance_rate);
          setTicketCount(statsRes.data.open_tickets);
        }
        
        if (orgsRes.data) setOrganizations(orgsRes.data);
        if (logsRes.data) setAuditLogs(logsRes.data);
        if (infraRes.data) setInfraMetrics(infraRes.data);
        
      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Organizations', value: '124', icon: Building2, change: '8.5%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Active Tenants', value: organizations.length.toString(), icon: User, change: '6.2%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Total Employees', value: '24,532', icon: User, change: '7.1%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Total Assessments', value: '45,897', icon: Monitor, change: '9.3%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Compliance Rate', value: complianceRate.toFixed(1) + '%', icon: ShieldCheck, change: '4.8%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Pending Risk Alerts', value: '83', icon: ShieldAlert, change: '-3.2%', trend: 'down' as const, sub: 'vs last 30 days' },
    { label: 'Active Sessions', value: '1,248', icon: Monitor, change: '12.4%', trend: 'up' as const, sub: 'vs last 30 days' },
    { label: 'Platform Health', value: '99.98%', icon: CheckCircle2, change: 'Operational', trend: 'neutral' as const, sub: 'All systems' },
  ];

  const chartData = [
    { name: 'May 12', value: 2500, last: 1800 },
    { name: 'May 19', value: 3100, last: 2200 },
    { name: 'May 26', value: 2900, last: 2500 },
    { name: 'Jun 2', value: 3400, last: 2800 },
    { name: 'Jun 9', value: 4200, last: 3200 },
  ];

  const complianceData = [
    { name: 'Compliant', value: 76.4, color: '#10B981' },
    { name: 'In Progress', value: 19.5, color: '#3B82F6' },
    { name: 'At Risk', value: 4.2, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing with Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Welcome back, Super Admin 👋</h2>
          <p className="text-[14px] text-slate-700 font-medium">Here's what's happening across your SimplyDSE platform.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            May 12, 2024 - Jun 12, 2024
          </div>
          <Link 
            href="/admin/organizations/new" 
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[13px] font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:translate-y-[-2px] transition-all active:scale-95 group shrink-0"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Provision New Tenant
          </Link>
        </div>
      </div>

      {/* High-Level Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-6">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Platform Overview Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[16px] font-semibold text-slate-900">Platform Overview</h3>
              <p className="text-[12px] text-slate-700 font-medium mt-1">Global activity across all tenants</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-slate-700 outline-none">
              <option>Assessments Completed</option>
              <option>Active Users</option>
              <option>Compliance Score</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                  tickFormatter={(v) => `${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="last" 
                  stroke="#E2E8F0" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[12px] font-semibold text-slate-700">This Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-200 border-dashed" />
              <span className="text-[12px] font-semibold text-slate-700">Last Period</span>
            </div>
          </div>
        </div>

        {/* Compliance Overview Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-[16px] font-semibold text-slate-900 mb-8">Compliance Overview</h3>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-semibold text-slate-900">76.4%</p>
              <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest mt-1">Overall Compliance</p>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="text-[13px] font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Operations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* Recent System Alerts */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[16px] font-semibold text-slate-900">Recent System Alerts</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { title: 'High Risk Assessments', desc: '23 assessments require attention', time: '2 min ago', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
              { title: 'Failed Email Deliveries', desc: '12 emails failed to deliver', time: '15 min ago', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
              { title: 'Storage Usage', desc: 'Storage usage at 78%', time: '1 hr ago', icon: HardDrive, color: 'text-blue-500', bg: 'bg-blue-50' },
              { title: 'New Organization', desc: 'TechCorp Ltd. has joined', time: '3 hr ago', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-5 group cursor-pointer">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", alert.bg, alert.color)}>
                  <alert.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{alert.title}</p>
                    <p className="text-[11px] text-slate-700 font-medium">{alert.time}</p>
                  </div>
                  <p className="text-[12px] text-slate-700 font-medium">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Activity (Top 5) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[16px] font-semibold text-slate-900">Tenant Activity (Top 5)</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'TechCorp Ltd.', assessments: '1,234', trend: '+ 12%', color: 'text-emerald-500' },
              { name: 'HealthFirst Group', assessments: '987', trend: '+ 8%', color: 'text-emerald-500' },
              { name: 'Gov Services UK', assessments: '745', trend: '+ 5%', color: 'text-emerald-500' },
              { name: 'RetailMax Holdings', assessments: '632', trend: '+ 3%', color: 'text-emerald-500' },
              { name: 'BuildRight Construction', assessments: '512', trend: '+ 7%', color: 'text-emerald-500' },
            ].map((tenant, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900">{tenant.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[13px] font-semibold text-slate-900">{tenant.assessments}</span>
                  <div className={cn("flex items-center gap-1 text-[11px] font-bold w-12 justify-end", tenant.color)}>
                    <TrendingUp className="w-3 h-3" />
                    {tenant.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        {/* Core Management Hub */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-6">
            <div>
              <h3 className="text-[16px] md:text-[17px] font-semibold text-slate-900">Active Organizations</h3>
              <p className="text-[11px] md:text-[12px] text-slate-700 font-medium mt-1">Real-time status of production environments</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input 
                  type="text" 
                  placeholder="Filter tenants..."
                  className="pl-11 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-[12px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all w-full sm:w-64"
                />
              </div>
              <button className="hidden sm:block p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all shadow-sm">
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.1em]">Tenant Identity</th>
                  <th className="px-8 py-4 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.1em]">Region</th>
                  <th className="px-8 py-4 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.1em]">Health</th>
                  <th className="px-8 py-4 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.1em]">Compliance</th>
                  <th className="px-8 py-4 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.1em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.length > 0 ? organizations.map((org, i) => (
                  <tr key={org.id} className="group hover:bg-slate-50 transition-all cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-brand-primary group-hover:bg-white group-hover:shadow-md transition-all">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-slate-900 leading-none truncate">{org.name}</p>
                          <p className="text-[11px] text-slate-700 font-medium mt-1 truncate">{org.slug}.simplydse.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light/50 text-brand-primary rounded-xl text-[11px] font-bold uppercase tracking-wider border border-brand-light">
                        <Globe className="w-3.5 h-3.5" />
                        {org.region}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
                        <span className="text-[13px] font-bold text-slate-700">Optimal</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-emerald-600">84%</span>
                          <span className="text-slate-300">ISO-27001</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button className="p-3 text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-lg rounded-2xl transition-all">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                          <Building2 className="w-10 h-10" />
                        </div>
                        <div>
                          <p className="text-[18px] font-bold text-slate-900">No organizations detected</p>
                          <p className="text-[14px] text-slate-400 mt-2 font-medium">Provision your first enterprise tenant to begin platform management.</p>
                        </div>
                        <Link href="/admin/organizations/new" className="text-brand-primary font-bold text-[13px] hover:underline">
                          Provision first tenant →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Intelligence */}
        <div className="lg:col-span-4 space-y-8">
          {/* User Registrations */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-semibold text-slate-900">User Registrations</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="flex items-end gap-6 h-24 mb-4">
              <div className="flex-1">
                <p className="text-2xl font-semibold text-slate-900">1,429</p>
                <p className="text-[11px] text-slate-700 font-medium mt-1">New users this month</p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-2">
                  <TrendingUp className="w-3 h-3" />
                  14.6% <span className="text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{v:40},{v:70},{v:45},{v:90},{v:65},{v:80},{v:50},{v:95},{v:60}]}>
                    <Bar dataKey="v" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Assessments Completed */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-semibold text-slate-900">Assessments Completed</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="flex items-end gap-6 h-24 mb-4">
              <div className="flex-1">
                <p className="text-2xl font-semibold text-slate-900">3,892</p>
                <p className="text-[11px] text-slate-700 font-medium mt-1">This month</p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-2">
                  <TrendingUp className="w-3 h-3" />
                  9.8% <span className="text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{v:60},{v:40},{v:80},{v:55},{v:90},{v:70},{v:45},{v:85},{v:65}]}>
                    <Bar dataKey="v" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Active Workflows */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-semibold text-slate-900">Active Workflows</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <p className="text-[11px] text-slate-700 font-bold mb-6"><span className="text-slate-900 text-lg mr-1">156</span> Running workflows</p>
            <div className="space-y-4">
              {[
                { label: 'Assessment Reminders', count: 78, status: 'Active', color: 'text-emerald-500' },
                { label: 'Risk Escalations', count: 32, status: 'Active', color: 'text-emerald-500' },
                { label: 'Compliance Follow-ups', count: 46, status: 'Active', color: 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span className="text-[12px] font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-slate-900">{item.count}</span>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", item.color)}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-semibold text-slate-900">Support Tickets</h3>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <p className="text-[11px] text-slate-700 font-bold mb-6"><span className="text-slate-900 text-lg mr-1">32</span> Open tickets</p>
            <div className="space-y-4">
              {[
                { label: 'High Priority', count: 8, color: 'bg-rose-500' },
                { label: 'Medium Priority', count: 16, color: 'bg-amber-500' },
                { label: 'Low Priority', count: 8, color: 'bg-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-4 rounded-full", item.color)} />
                    <span className="text-[12px] font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Bottom Operational Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* System Health */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-semibold text-slate-900">System Health</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'API Service', status: 'Operational', color: 'bg-emerald-500' },
              { name: 'Database', status: 'Operational', color: 'bg-emerald-500' },
              { name: 'Redis', status: 'Operational', color: 'bg-emerald-500' },
              { name: 'Background Jobs', status: 'Operational', color: 'bg-emerald-500' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", service.color)} />
                  <span className="text-[13px] font-semibold text-slate-700">{service.name}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">{service.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-semibold text-slate-900">Storage Usage</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{v: 78}, {v: 22}]}
                    innerRadius={45}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="v"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#F1F5F9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-slate-900">78%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Used</p>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-700">Total Storage</span>
                <span className="text-[12px] font-bold text-slate-900">2.4 TB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-700">Used</span>
                <span className="text-[12px] font-bold text-slate-900">1.87 TB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-700">Available</span>
                <span className="text-[12px] font-bold text-slate-900">0.53 TB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-semibold text-slate-900">Recent Audit Logs</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { text: 'Admin login by superadmin', time: '2 min ago' },
              { text: 'Organization updated: TechCorp Ltd.', time: '15 min ago' },
              { text: 'User role changed: John Smith', time: '45 min ago' },
              { text: 'Assessment deleted: ID #A-12345', time: '1 hr ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate">{log.text}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Notifications */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-semibold text-slate-900">Platform Notifications</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Scheduled Maintenance', date: '2 days ago', sub: 'June 15, 2024 02:00 - 04:00 UTC', icon: Clock },
              { title: 'New Feature Released', date: '5 days ago', sub: 'Advanced Compliance Reports', icon: Zap },
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-500">
                  <note.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 leading-none truncate">{note.title}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">{note.date}</p>
                  <p className="text-[11px] text-slate-700 font-medium mt-1 truncate">{note.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

