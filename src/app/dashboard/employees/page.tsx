'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  MoreHorizontal,
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    highRisk: 0
  });

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) return;

        const { data: emps, error } = await supabase
          .from('profiles')
          .select(`
            *,
            assessments(status, risk_level, score, completed_at)
          `)
          .eq('organization_id', profile.organization_id)
          .order('full_name', { ascending: true });

        if (error) throw error;

        const processedEmps = emps.map((emp: any) => {
          const latestAssessment = emp.assessments?.sort((a: any, b: any) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          )[0];

          return {
            id: emp.id.substring(0, 8).toUpperCase(),
            name: emp.full_name || emp.email || 'Unnamed',
            email: emp.email,
            department: 'General',
            complianceScore: latestAssessment?.score || 0,
            status: latestAssessment ? (latestAssessment.status === 'completed' ? 'Active' : 'In Progress') : 'Not Started',
            riskLevel: latestAssessment?.risk_level === 'high' ? 'High' : latestAssessment?.risk_level === 'medium' ? 'Medium' : 'Low',
            lastAssessment: latestAssessment ? new Date(latestAssessment.completed_at).toLocaleDateString() : 'Never'
          };
        });

        setEmployees(processedEmps);
        
        // Calculate stats
        const highRiskCount = processedEmps.filter((e: any) => e.riskLevel === 'High').length;
        const compliantCount = processedEmps.filter((e: any) => e.complianceScore > 80).length;

        setStats({
          total: processedEmps.length,
          compliant: compliantCount,
          highRisk: highRiskCount
        });

      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp: any) => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-[14px] text-slate-500 font-medium">Manage employee compliance profiles, risk levels, and assessment history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Employees</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h4>
            <p className="text-[11px] text-emerald-500 font-bold mt-1">Active</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliant</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stats.compliant}</h4>
            <p className="text-[11px] text-slate-400 font-bold mt-1">{stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0}% Coverage</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">High Risk</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stats.highRisk}</h4>
            <p className="text-[11px] text-rose-500 font-bold mt-1">Action Required</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
            <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none">
              <option>Risk Level: All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2rem]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Fetching employee records...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2rem]">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-sm font-medium text-slate-500">No employees found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 leading-none">{employee.name}</h4>
                    <p className="text-[12px] text-slate-400 font-medium mt-1.5">{employee.id}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">{employee.department}</span>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight",
                    employee.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                    employee.status === 'Overdue' ? "bg-rose-50 text-rose-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    {employee.status}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">Last: {employee.lastAssessment}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      employee.riskLevel === 'Low' ? "bg-emerald-500" :
                      employee.riskLevel === 'Medium' ? "bg-amber-500" :
                      "bg-rose-500"
                    )} />
                    <span className="text-[11px] font-bold text-slate-600">{employee.riskLevel} Risk</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliance Score</span>
                    <span className={cn(
                      "text-[13px] font-black",
                      employee.complianceScore > 80 ? "text-emerald-500" :
                      employee.complianceScore > 50 ? "text-amber-500" :
                      "text-rose-500"
                    )}>{employee.complianceScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        employee.complianceScore > 80 ? "bg-emerald-500" :
                        employee.complianceScore > 50 ? "bg-amber-500" :
                        "bg-rose-500"
                      )} 
                      style={{ width: `${employee.complianceScore}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </button>
                  <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
