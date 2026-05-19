'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
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
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';
import { StatCard } from '@/components/dashboard/StatCard';
import { CreateAssessmentModal } from '@/components/dashboard/CreateAssessmentModal';
import Link from 'next/link';

export default function ComplianceOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('Your Organisation');
  
  const [kpis, setKpis] = useState({
    totalEmployees: 0,
    completedAssessments: 0,
    nonCompliant: 0,
    pendingAssessments: 0,
    atRisk: 0,
    complianceRate: 0,
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchWorkspaceData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { organizationId, organizationName } = await getTenantContext();
        if (!active) return;

        if (!organizationId) {
          setLoading(false);
          return;
        }

        const currentOrgId = organizationId;
        setOrgId(currentOrgId);
        setOrgName(organizationName || 'Your Organisation');

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            assessments(status, risk_level, score, completed_at)
          `)
          .eq('organization_id', currentOrgId);

        if (profileError) throw profileError;
        if (!active) return;

        let completed = 0;
        let nonCompliantCount = 0;
        let pending = 0;
        let atRiskCount = 0;
        let empList: any[] = [];

        if (profiles) {
          profiles.forEach((p: any) => {
            const latestAssessment = p.assessments?.sort((a: any, b: any) => 
              new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
            )[0];

            const status = latestAssessment?.status || 'not_started';
            const risk = latestAssessment?.risk_level || 'none';

            if (status === 'completed') {
              completed++;
              if (risk === 'high') {
                nonCompliantCount++;
                atRiskCount++;
              } else if (risk === 'medium') {
                atRiskCount++;
              }
            } else if (status === 'pending' || status === 'in_progress') {
              pending++;
            }

            empList.push({
              id: p.id,
              name: p.full_name || p.email || 'Unnamed',
              dept: 'General',
              issue: status === 'completed' ? (risk === 'high' ? 'High Risk Identified' : 'None') : 'Awaiting Assessment',
              status: status,
              risk: risk
            });
          });
        }

        const safeTotal = profiles?.length || 0;
        const rate = safeTotal > 0 ? Math.round((completed / safeTotal) * 100) : 0;

        setKpis({
          totalEmployees: safeTotal,
          completedAssessments: completed,
          nonCompliant: nonCompliantCount,
          pendingAssessments: pending,
          atRisk: atRiskCount,
          complianceRate: rate,
        });

        setEmployees(empList);

      } catch (error) {
        console.error("Error fetching Workspace data:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchWorkspaceData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        fetchWorkspaceData();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const distributionData = [
    { name: 'Compliant', value: Math.max(kpis.completedAssessments - kpis.nonCompliant, 0), color: '#10B981' },
    { name: 'In Progress/Pending', value: kpis.pendingAssessments, color: '#F59E0B' },
    { name: 'Non-Compliant', value: kpis.nonCompliant, color: '#EF4444' },
    { name: 'Not Started', value: Math.max(kpis.totalEmployees - (kpis.completedAssessments + kpis.pendingAssessments), 0), color: '#94A3B8' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading Overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 inline-block">
            HR Dashboard
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compliance Overview</h1>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">Real-time health intelligence across your organization.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20"
          >
            <ClipboardList className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* KPI Row with Deep Linking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link href="/dashboard/compliance?tab=analytics">
          <StatCard 
            title="Overall Compliance" 
            value={`${kpis.complianceRate}%`} 
            trend="Live" 
            isPositive={kpis.complianceRate > 80}
            icon={ShieldCheck}
            iconColor="emerald"
          />
        </Link>
        <Link href="/dashboard/compliance?tab=tracking">
          <StatCard 
            title="Completed" 
            value={kpis.completedAssessments} 
            trend="Active" 
            icon={ClipboardList}
            iconColor="amber"
          />
        </Link>
        <Link href="/dashboard/compliance?tab=risks">
          <StatCard 
            title="Non-Compliant" 
            value={kpis.nonCompliant} 
            trend="High Risk" 
            isPositive={kpis.nonCompliant === 0}
            icon={AlertCircle}
            iconColor="rose"
          />
        </Link>
        <Link href="/dashboard/compliance?tab=tracking">
          <StatCard 
            title="Pending" 
            value={kpis.pendingAssessments} 
            trend="Awaiting" 
            isPositive={false}
            icon={Clock}
            iconColor="indigo"
          />
        </Link>
        <Link href="/dashboard/employees?tab=directory">
          <StatCard 
            title="At Risk" 
            value={kpis.atRisk} 
            trend="Monitor" 
            isPositive={kpis.atRisk === 0}
            icon={Users}
            iconColor="blue"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Status Distribution */}
        <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest">Status Distribution</h3>
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
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
              <p className="text-[24px] font-black text-slate-900 tracking-tighter">{kpis.totalEmployees}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Headcount</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-none">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    {item.value} {kpis.totalEmployees > 0 ? `(${Math.round((item.value / kpis.totalEmployees) * 100)}%)` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Table Section - Dynamic */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Organisation Employees</h3>
            <button className="text-[11px] font-bold text-blue-600 hover:underline">Export Full Report</button>
          </div>
          
          <div className="flex-1 overflow-auto">
            {employees.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                 <Users className="w-10 h-10 mb-4 opacity-50" />
                 <p className="text-sm font-medium">No employee records found.</p>
               </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 sticky top-0 z-10">
                    <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identified Risk</th>
                    <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500 border border-white shadow-sm">
                            {emp.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                          </div>
                          <span className="text-[13px] font-bold text-slate-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight",
                          emp.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                          emp.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {emp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[12px] font-bold">
                         {emp.risk === 'high' ? (
                            <span className="flex items-center gap-1.5 text-rose-600"><AlertCircle className="w-4 h-4"/> High Risk</span>
                         ) : emp.risk === 'medium' ? (
                            <span className="flex items-center gap-1.5 text-amber-600"><AlertTriangle className="w-4 h-4"/> Medium Risk</span>
                         ) : (
                            <span className="text-slate-400 font-medium">Clear</span>
                         )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/employees`} className="px-4 py-2 bg-blue-600/10 text-blue-600 text-[11px] font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all">Review</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Create Assessment Modal */}
      {orgId && (
        <CreateAssessmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          organizationId={orgId}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
