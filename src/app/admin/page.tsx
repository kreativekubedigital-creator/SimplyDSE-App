'use client';

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
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
interface Organisation {
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
  const [organizations, setorganizations] = useState<Organisation[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [infraMetrics, setInfraMetrics] = useState<InfraMetric[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [complianceRate, setComplianceRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, logsRes, infraRes, orgsRes, analyticsRes, notificationsRes] = await Promise.all([
          supabase.from('global_dashboard_stats').select('*').maybeSingle(),
          supabase.from('audit_logs').select(`
            *,
            profiles ( full_name ),
            organizations ( name )
          `).order('created_at', { ascending: false }).limit(5),
          supabase.from('System_metrics').select('*').order('name', { ascending: true }),
          supabase.from('organizations').select('*').order('created_at', { ascending: false }),
          supabase.from('analytics_snapshots').select('*').order('timestamp', { ascending: true }).limit(5),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(3)
        ]);

        if (statsRes.data) {
          setStats(statsRes.data);
          setComplianceRate(statsRes.data.latest_compliance_rate || 0);
          setTicketCount(statsRes.data.open_tickets || 0);
        }
        
        if (orgsRes.data) setorganizations(orgsRes.data);
        if (logsRes.data) setAuditLogs(logsRes.data);
        if (infraRes.data) setInfraMetrics(infraRes.data);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
        if (notificationsRes.data) setNotifications(notificationsRes.data);
        
      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Organizations', value: (stats?.total_tenants || organizations.length).toString(), icon: Building2, trend: 'Current Total', iconColor: 'blue' },
    { title: 'Active Workspaces', value: organizations.filter(o => o.status === 'active').length.toString(), icon: Zap, trend: 'Operating', iconColor: 'emerald' },
    { title: 'Total Users', value: (stats?.total_users || 0).toString(), icon: User, trend: `+${stats?.new_users_30d || 0} recent`, iconColor: 'indigo' },
    { title: 'Compliance Rate', value: complianceRate.toFixed(1) + '%', icon: ShieldCheck, trend: 'System Wide', iconColor: 'purple' },
    { title: 'System Health', value: (stats?.avg_infra_health || 0).toFixed(1) + '%', icon: Activity, trend: 'Optimal', iconColor: 'emerald' },
    { title: 'Open Tickets', value: ticketCount.toString(), icon: Ticket, trend: `${stats?.critical_tickets || 0} critical`, isPositive: false, iconColor: 'rose' },
    { title: 'Risk Alerts', value: (stats?.high_risk_assessments || 0).toString(), icon: ShieldAlert, trend: 'Attention', isPositive: false, iconColor: 'rose' },
    { title: 'Total Assessments', value: (stats?.total_assessments || 0).toString(), icon: CheckCircle2, trend: `${stats?.completed_assessments || 0} done`, iconColor: 'blue' },
  ];

  const chartData = analytics.map(a => ({
    name: new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: a.active_users,
    last: Math.floor(a.active_users * 0.8)
  }));

  const complianceData = [
    { name: 'Compliant', value: complianceRate || 0, color: '#10B981' },
    { name: 'In Progress', value: complianceRate ? 100 - complianceRate : 100, color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating Dashboard...</p>
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
          <p className="text-[14px] text-slate-700 font-medium">Global operations and Workspace health monitoring dashboard.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            Live Platform Feed
          </div>
          <Link 
            href="/admin/organizations/new" 
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[13px] font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:translate-y-[-2px] transition-all active:scale-95 group shrink-0"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            New Workspace
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-4">
        {statCards.map((card, i) => {
          const href = card.title === 'Compliance Rate' ? '/admin/compliance' :
                       card.title === 'System Health' ? '/admin/workflows?tab=health' :
                       card.title === 'Total Users' ? '/admin/users' :
                       card.title === 'Risk Alerts' ? '/admin/compliance?tab=security' :
                       undefined;
          
          if (href) {
            return (
              <Link key={i} href={href} className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <StatCard {...card} />
              </Link>
            );
          }
          return <StatCard key={i} {...card} />;
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Platform Overview */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform Performance</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Health data aggregated across all clusters</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            {chartData.length > 0 ? (
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
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                <Activity className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">No Health data</p>
                <p className="text-[11px] text-slate-400 mt-1">Waiting for initial analytics snapshot...</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Compliance */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Global Compliance</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="w-full aspect-square max-w-[200px] relative">
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
                <p className="text-3xl font-bold text-slate-900">{complianceRate.toFixed(1)}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-6 border-t border-slate-50">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="text-[13px] font-bold text-slate-900">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Management Hub - Fixed Grid Wrapping */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active organizations Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active organizations</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Workspace environments currently active in production</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter Workspaces..."
                  className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Identity</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Region</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.length > 0 ? organizations.map((org) => (
                  <tr key={org.id} className="group hover:bg-slate-50 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 leading-none truncate">{org.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-1.5 truncate">{org.slug}.simplydse.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        <Globe className="w-3.5 h-3.5" />
                        {org.region}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", org.status === 'active' ? "bg-emerald-500 shadow-emerald-500/40" : "bg-amber-500 shadow-amber-500/40")} />
                        <span className="text-[13px] font-bold text-slate-700 capitalize">{org.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-white hover:shadow-md rounded-xl transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">No production Workspaces found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-[15px] font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Growth Intelligence
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.new_users_30d || 0}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Registrations</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">Past 30 Days</span>
                  </div>
                </div>
                <div className="h-16 w-full">
                  {analytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.map(a => ({ v: a.new_users }))}>
                        <Bar dataKey="v" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Data</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.completed_assessments || 0}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assessments Executed</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">System Total</span>
                  </div>
                </div>
                <div className="h-16 w-full">
                  {analytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.map(a => ({ v: a.assessments_completed }))}>
                        <Bar dataKey="v" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[15px] font-bold text-white">System Criticality</h3>
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-6">
                {infraMetrics.length > 0 ? infraMetrics.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-400">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", item.health_score >= 90 ? "bg-emerald-500" : "bg-amber-500")} />
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">{item.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-[11px] font-bold text-slate-400 uppercase">No system data available</p>
                )}
              </div>
              <Link 
                href="/admin/compliance"
                className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center"
              >
                Execute Global Audit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Diagnostics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* System Clusters */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-900 mb-8">System Clusters</h3>
          <div className="space-y-6">
            {infraMetrics.length > 0 ? infraMetrics.slice(0, 4).map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", service.health_score > 90 ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-[13px] font-bold text-slate-700">{service.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{service.health_score}%</span>
              </div>
            )) : (
              <p className="text-[11px] font-bold text-slate-400 uppercase">Pinging nodes...</p>
            )}
          </div>
        </div>

        {/* Live Security Feed */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-bold text-slate-900">Live Security Feed</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {auditLogs.length > 0 ? auditLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 leading-none truncate">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5 truncate">
                    {log.organizations?.name || 'System'} • {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
            )) : (
              <p className="text-[11px] font-bold text-slate-400 uppercase text-center py-8">Awaiting events...</p>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-900 mb-8">Notifications</h3>
          <div className="space-y-6">
            {notifications.length > 0 ? notifications.map((note, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-500")}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 leading-tight">{note.title}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No notifications</p>}
          </div>
          <button className="w-full mt-8 py-3 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all uppercase tracking-widest">
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
