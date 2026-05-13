'use client';

import React, { useState } from 'react';
import { useComplianceData } from '@/hooks/useComplianceData';
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
  Download,
  AlertTriangle,
  ClipboardList,
  Zap,
  MessageCircle,
  Flag,
  User,
  Clock,
  ArrowRight,
  Loader2,
  MoreVertical,
  MoreHorizontal,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';

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

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ComplianceContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'analytics' | 'risks' | 'tracking'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const { assessments, risks, stats, loading } = useComplianceData();

  React.useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['analytics', 'risks', 'tracking'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const data = { assessments, risks, stats };

  const filteredItems = (activeTab === 'risks' ? data.risks : data.assessments).filter((item: any) => 
    item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Risk & Compliance</h1>
          <p className="text-[13px] text-slate-500 mt-1">Real-time intelligence Hub for Organisation-wide compliance performance and risk mitigations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Generate Compliance Audit
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100">
        {[
          { id: 'analytics', label: 'Compliance Analytics', icon: TrendingUp },
          { id: 'risks', label: 'Risks & Escalations', icon: AlertTriangle },
          { id: 'tracking', label: 'Assessment Tracking', icon: ClipboardList },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-4 text-[13px] font-bold transition-all relative flex items-center gap-2",
              activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title="Global Compliance" 
              value={`${data.assessments.length > 0 ? Math.round((data.stats.completed / data.assessments.length) * 100) : 0}%`} 
              trend="+4.2%" 
              icon={ShieldCheck}
              iconColor="blue"
            />
            <StatCard 
              title="Assigned Target" 
              value="95.0%" 
              trend="-6.6%" 
              isPositive={false}
              icon={Target}
              iconColor="indigo"
            />
            <StatCard 
              title="Critical Risks" 
              value={data.stats.critical} 
              trend={data.stats.critical > 0 ? "Action Required" : "Stable"} 
              isPositive={data.stats.critical === 0}
              icon={Zap}
              iconColor="rose"
            />
            <StatCard 
              title="Pending Reviews" 
              value={data.stats.pending} 
              trend="Awaiting" 
              isPositive={false}
              icon={Clock}
              iconColor="amber"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Compliance Trend</h3>
                  <p className="text-[13px] text-slate-400 font-medium">Organisation score over the last 6 months</p>
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
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Department Benchmarking</h3>
                  <p className="text-[13px] text-slate-400 font-medium">Compliance performance by business unit</p>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={100} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="compliance" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-rose-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">Critical Issues</p>
                  <h4 className="text-2xl font-bold text-slate-900">{data.stats.critical}</h4>
                </div>
              </div>
              <p className="text-[12px] text-slate-700 font-medium leading-relaxed">Require immediate intervention based on high-risk results.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">High Priority</p>
                  <h4 className="text-2xl font-bold text-slate-900">{data.stats.high}</h4>
                </div>
              </div>
              <p className="text-[12px] text-slate-700 font-medium leading-relaxed">Medium risk cases assigned for safety review and follow-up.</p>
            </div>
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-sm font-bold mb-2">Automated Escalation</h4>
                 <p className="text-[11px] text-slate-400">System automatically escalates high-risk cases after 48h non-response.</p>
               </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Active Risk Incidents</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search risks..." 
                    className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>
             <div className="divide-y divide-slate-50">
                {loading ? (
                  <div className="p-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-[13px] text-slate-400 font-medium mt-3">Loading risk data...</p>
                  </div>
                ) : data.risks.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 text-[13px]">No active risk incidents found.</div>
                ) : (
                  data.risks.map((incident: any) => (
                    <div key={incident.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          incident.riskLevel === 'High' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                        )}>
                          <Flag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">{incident.employee}</span>
                            <span className="text-[11px] text-slate-500 font-medium">• {incident.id}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight",
                              incident.riskLevel === 'High' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                            )}>
                              {incident.riskLevel} Risk
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-600 font-medium mt-1">Review required for ergonomic risk escalations.</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold"><User className="w-3 h-3" /> {incident.department}</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold"><Clock className="w-3 h-3" /> {incident.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-600/10 hover:scale-[1.02] transition-all">Investigate</button>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Assessment Logs</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tracking..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
           </div>
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Employee</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-[13px] text-slate-400 font-medium mt-3">Hydrating assessment records...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-[13px]">No matching records found.</td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{item.employee}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{item.id}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                          item.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>{item.status}</span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", item.riskLevel === 'Low' ? "bg-emerald-500" : item.riskLevel === 'Medium' ? "bg-amber-500" : "bg-rose-500")} />
                           <span className="text-[12px] font-bold text-slate-700">{item.riskLevel}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", item.completion === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${item.completion}%` }} />
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}

export default function RiskCompliancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <ComplianceContent />
    </Suspense>
  );
}
