'use client';

import React, { useState, useEffect } from 'react';
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
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        setLoading(true);
        // 1. Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }

        // 2. Get User's Organisation (Workspace Isolation)
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id, organizations(name)')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) {
          console.warn("User does not belong to an Organisation.");
          setLoading(false);
          return;
        }

        const currentOrgId = profile.organization_id;
        setOrgId(currentOrgId);
        
        const orgs: any = profile.organizations;
        if (orgs) {
          const name = Array.isArray(orgs) ? orgs[0]?.name : orgs.name;
          if (name) {
            setOrgName(name);
          }
        }

        // 3. Fetch Workspace-Isolated KPIs
        const { count: totalEmp } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrgId);

        const { data: assessments } = await supabase
          .from('assessments')
          .select('*, profiles(full_name, email)')
          .eq('organization_id', currentOrgId);

        let completed = 0;
        let nonCompliant = 0;
        let pending = 0;
        let atRisk = 0;
        let empList: any[] = [];

        if (assessments) {
          (assessments as any[]).forEach((a: any) => {
            if (a.status === 'completed') {
              completed++;
              if (a.risk_level === 'high') {
                nonCompliant++;
                atRisk++;
              } else if (a.risk_level === 'medium') {
                atRisk++;
              }
            } else if (a.status === 'pending' || a.status === 'in_progress') {
              pending++;
            }

            // Map for the table
            empList.push({
              id: a.id,
              name: a.profiles?.full_name || 'Unknown',
              dept: 'Operations', // Hardcoded for now as dept is not in schema
              issue: a.status === 'completed' ? (a.risk_level === 'high' ? 'High Risk Identified' : 'None') : 'Pending Assessment',
              dueDate: 'N/A', // Would be calculated based on creation date
              status: a.status,
              risk: a.risk_level || 'none'
            });
          });
        }

        const safeTotal = totalEmp || 0;
        const rate = safeTotal > 0 ? Math.round((completed / safeTotal) * 100) : 0;

        setKpis({
          totalEmployees: safeTotal,
          completedAssessments: completed,
          nonCompliant,
          pendingAssessments: pending,
          atRisk,
          complianceRate: rate,
        });

        setEmployees(empList);

      } catch (error) {
        console.error("Error fetching Workspace data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaceData();
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
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading Organisation Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 inline-block">
            {orgName} Dashboard
          </span>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Compliance Overview</h1>
          <p className="text-[12px] text-slate-700 mt-1 font-medium">Monitor compliance status for your organisation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Get the template ID
                const { data: template } = await supabase
                  .from('assessment_templates')
                  .select('id')
                  .eq('is_active', true)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();

                if (!template) throw new Error('No active assessment templates found.');

                // 2. Create the assessment record
                const { data: assessment, error } = await supabase
                  .from('assessments')
                  .insert({
                    organization_id: orgId,
                    user_id: user.id,
                    template_id: template.id,
                    type: 'DSE_2024',
                    status: 'pending'
                  })
                  .select()
                  .single();

                if (error) throw error;

                // 3. Redirect to the take page
                window.location.href = `/dashboard/assessments/${assessment.id}/take`;
              } catch (err) {
                console.error('Failed to start assessment:', err);
                alert('Could not start assessment. Please contact support.');
              } finally {
                setLoading(false);
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
          >
            <ClipboardList className="w-4 h-4" />
            Start New Assessment
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
          value={`${kpis.complianceRate}%`} 
          trend="Live" 
          isPositive={kpis.complianceRate > 80}
          icon={ShieldCheck}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <KPICard 
          title="Completed Assessments" 
          value={kpis.completedAssessments.toString()} 
          trend="Active" 
          isPositive={true}
          icon={ClipboardList}
          iconColor="bg-amber-50 text-amber-600"
        />
        <KPICard 
          title="Non-Compliant" 
          value={kpis.nonCompliant.toString()} 
          trend="High Risk" 
          isPositive={kpis.nonCompliant === 0}
          icon={AlertCircle}
          iconColor="bg-rose-50 text-rose-600"
        />
        <KPICard 
          title="Pending Assessments" 
          value={kpis.pendingAssessments.toString()} 
          trend="Awaiting" 
          isPositive={false}
          icon={Clock}
          iconColor="bg-purple-50 text-purple-600"
        />
        <KPICard 
          title="At Risk Employees" 
          value={kpis.atRisk.toString()} 
          trend="Monitor" 
          isPositive={kpis.atRisk === 0}
          icon={Users}
          iconColor="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Status Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-8">Status Distribution</h3>
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
              <p className="text-[20px] font-bold text-slate-900">{kpis.totalEmployees}</p>
              <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Total Staff</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[11px] font-semibold text-slate-900 leading-none">{item.name}</p>
                  <p className="text-[10px] text-slate-700 font-medium mt-1">
                    {item.value} {kpis.totalEmployees > 0 ? `(${Math.round((item.value / kpis.totalEmployees) * 100)}%)` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Table Section - Dynamic */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-slate-900">Organisation Employees</h3>
            <button className="text-[10px] font-semibold text-brand-primary hover:underline">Export Report</button>
          </div>
          
          <div className="flex-1 overflow-auto">
            {employees.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                 <Users className="w-10 h-10 mb-4 opacity-50" />
                 <p className="text-sm font-medium">No employee records found for {orgName}.</p>
               </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 sticky top-0 z-10">
                    <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Employee</th>
                    <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest">Identified Risk</th>
                    <th className="px-8 py-4 text-[9px] font-semibold text-slate-700 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-700 uppercase">
                            {emp.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest",
                          emp.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                          emp.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {emp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-[12px] font-medium text-slate-800">
                         {emp.risk === 'high' ? (
                            <span className="flex items-center gap-1.5 text-rose-600"><AlertCircle className="w-3.5 h-3.5"/> High Risk</span>
                         ) : emp.risk === 'medium' ? (
                            <span className="flex items-center gap-1.5 text-amber-600"><AlertTriangle className="w-3.5 h-3.5"/> Medium Risk</span>
                         ) : (
                            <span className="text-slate-500">None</span>
                         )}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-[10px] font-semibold rounded-lg hover:bg-brand-primary hover:text-white transition-all">Review</button>
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
          isPositive ? "text-emerald-600" : "text-amber-600"
        )}>
          {trend}
        </div>
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

