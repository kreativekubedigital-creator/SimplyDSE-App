'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { CreateAssessmentModal } from '@/components/dashboard/CreateAssessmentModal';
import { useComplianceData } from '@/hooks/useComplianceData';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';
import Link from 'next/link';
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
  Plus,
  Eye,
  X,
  CheckCircle2,
  Mail,
  FileText,
  UserCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';

// Dynamic data derived from hook


import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ComplianceContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'analytics' | 'risks' | 'tracking'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { assessments, risks, stats, loading, refetch, departmentStats, trendStats } = useComplianceData();
  const profile = useProfile();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isReminderSending, setIsReminderSending] = useState(false);
  const [showReminderSuccess, setShowReminderSuccess] = useState(false);

  const handleSendReminder = async (item: any) => {
    setIsReminderSending(true);
    try {
      // In a real app, this would call an API to send email/notification
      // For now, we simulate success and create an in-app notification record if table exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('notifications').insert({
          user_id: item.employeeId,
          title: 'Assessment Reminder',
          message: `HR has requested that you complete the ${item.assessmentName}.`,
          type: 'reminder',
          metadata: { assignment_id: item.id }
        });
      }

      setShowReminderSuccess(true);
      setTimeout(() => setShowReminderSuccess(false), 3000);
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('We could not send the reminder. Please try again.');
    } finally {
      setIsReminderSending(false);
    }
  };

  const handleRequestReassessment = async (item: any) => {
    if (!confirm(`Are you sure you want to request a reassessment for ${item.employeeName}? This will create a new assignment.`)) return;
    
    try {
      const { organizationId } = await getTenantContext();
      if (!organizationId) return;

      const { error } = await supabase.from('assessment_assignments').insert({
        organization_id: organizationId,
        employee_id: item.employeeId,
        assessment_template_id: item.assessmentTemplateId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        assigned_by: profile?.fullName || 'HR Manager'
      });

      if (error) throw error;
      
      alert('Reassessment requested successfully.');
      refetch();
    } catch (err) {
      console.error('Error requesting reassessment:', err);
      alert('Failed to request reassessment.');
    }
  };

  const handleRegeneratePdf = async (item: any) => {
    try {
      const confirmGen = confirm("Trigger PDF generation for this assessment?");
      if (!confirmGen) return;
      
      const res = await fetch('/api/generate-assessment-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: item.assessmentId,
          userId: item.employeeId,
          organizationId: profile.organizationId,
          employeeName: item.employeeName,
          companyName: profile.organizationName || 'Organisation',
          assessmentDate: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : new Date().toLocaleDateString(),
          overallScore: item.score || 0,
          overallRiskLevel: item.rawRisk || 'Low',
          categories: [], // The API will fetch details if needed, but passing empty for now
          employeeEmail: item.employeeEmail
        })
      });

      if (res.ok) {
        alert("PDF Generation triggered successfully. It will be available in a few moments.");
        refetch();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate");
      }
    } catch (e: any) {
      console.error("PDF Gen Error:", e);
      alert(`Failed to generate report: ${e.message}`);
    }
  };

  React.useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['analytics', 'risks', 'tracking'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const data = { assessments, risks, stats };

  const filteredItems = (activeTab === 'risks' ? data.risks : data.assessments).filter((item: any) => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter || (statusFilter === 'Pending' && item.status === 'Assigned');
    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const departments = Array.from(new Set(data.assessments.map((a: any) => a.department))).filter(Boolean) as string[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Management</h1>
          <p className="text-[13px] text-slate-500 mt-1">Real-time intelligence Hub for Organisation-wide compliance performance and risk mitigations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Generate Compliance Audit
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100 mb-6">
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

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        
        <select 
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="All">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

        <button 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('All');
            setDeptFilter('All');
          }}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {activeTab === 'analytics' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title="Global Compliance" 
              value={`${assessments.length > 0 ? Math.round((stats.completed / assessments.length) * 100) : 0}%`} 
              trend={stats.trend} 
              icon={ShieldCheck}
              iconColor="blue"
            />
            <StatCard 
              title="In Progress" 
              value={stats.inProgress} 
              trend="Active" 
              isPositive={true}
              icon={Target}
              iconColor="indigo"
            />
            <StatCard 
              title="Critical Risks" 
              value={stats.critical} 
              trend={stats.critical > 0 ? "Action Required" : "Stable"} 
              isPositive={stats.critical === 0}
              icon={Zap}
              iconColor="rose"
            />
            <StatCard 
              title="Pending Reviews" 
              value={stats.pending} 
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
                    <AreaChart data={trendStats || []}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                        domain={[0, 100]} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '16px', 
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        animationDuration={1500}
                      />
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
                    <BarChart data={departmentStats || []} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} 
                        width={80} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '16px', 
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Bar 
                        dataKey="compliance" 
                        fill="#2563eb" 
                        radius={[0, 8, 8, 0]} 
                        barSize={16}
                        animationDuration={1500}
                      />
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
                  <h4 className="text-2xl font-bold text-slate-900">{stats.critical}</h4>
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
                  <h4 className="text-2xl font-bold text-slate-900">{stats.high}</h4>
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
                ) : filteredItems.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 text-[13px]">No matching risk incidents found.</div>
                ) : (
                  filteredItems.map((incident: any) => (
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
                            <span className="text-[13px] font-bold text-slate-900">{incident.employeeName}</span>
                            <span className="text-[11px] text-slate-500 font-medium">• {incident.id.substring(0, 8).toUpperCase()}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight",
                              incident.rawRisk === 'critical' ? "bg-red-600 text-white" :
                              incident.rawRisk === 'high' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                            )}>
                              {incident.riskLevel} Risk
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-600 font-medium mt-1">Review required for ergonomic risk escalations.</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold"><UserCircle className="w-3 h-3" /> {incident.department}</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold"><Clock className="w-3 h-3" /> Due {incident.dueDate ? new Date(incident.dueDate).toLocaleDateString() : 'No date'}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedItem(incident)}
                        className="px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-600/10 hover:scale-[1.02] transition-all"
                      >
                        Investigate
                      </button>
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
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-[13px] text-slate-400 font-medium mt-3">Hydrating assessment records...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center text-slate-400 text-[13px]">No matching records found.</td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{item.employeeName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-medium">ID: {item.employeeIdOfficial || item.id.substring(0, 8).toUpperCase()}</p>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <p className="text-[10px] text-slate-400 font-medium">{item.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-[13px] font-bold text-slate-700">{item.assessmentName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">v{item.assessmentVersion}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[12px] font-medium text-slate-600">
                        {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not recorded'}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-[12px] font-medium",
                            item.isOverdue ? "text-rose-600" : "text-slate-600"
                          )}>
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No due date'}
                          </span>
                          {item.isOverdue && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase rounded-md w-fit">Overdue</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                          item.rawStatus === 'completed' ? "bg-emerald-50 text-emerald-600" : 
                          item.rawStatus === 'in_progress' ? "bg-blue-50 text-blue-600" : 
                          item.isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
                        )}>{item.status}</span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                           {item.rawStatus === 'assigned' || item.rawStatus === 'in_progress' ? (
                             <span className="text-[11px] text-slate-400 italic">Pending</span>
                           ) : (
                             <>
                               <div className={cn(
                                 "w-2 h-2 rounded-full", 
                                 item.rawRisk === 'low' ? "bg-emerald-500" : 
                                 item.rawRisk === 'medium' ? "bg-amber-500" : 
                                 item.rawRisk === 'high' || item.rawRisk === 'critical' ? "bg-rose-500" : "bg-slate-300"
                               )} />
                               <span className="text-[12px] font-bold text-slate-700">{item.riskLevel || 'Not assessed'}</span>
                             </>
                           )}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", item.completion === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${item.completion}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400">{item.completion}%</p>
                        </div>
                      </td>
                      <td className="pl-8 pr-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => setSelectedItem(item)}
                             className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 transition-all shrink-0"
                             title="View Details"
                           >
                             <Info className="w-4 h-4" />
                           </button>
                           
                           {item.rawStatus === 'completed' ? (
                             <>
                               <Link 
                                 href={`/employee/reports/${item.assessmentId}`}
                                 className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 transition-all shrink-0"
                                 title="View Web Report"
                               >
                                 <Eye className="w-4 h-4" />
                               </Link>
                               {item.pdfUrl ? (
                                 <a 
                                   href={item.pdfUrl} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 transition-all shrink-0"
                                   title="Download PDF"
                                 >
                                   <Download className="w-4 h-4" />
                                 </a>
                               ) : (
                                 <button 
                                   onClick={() => handleRegeneratePdf(item)}
                                   className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 transition-all shrink-0"
                                   title="Generate PDF Report"
                                 >
                                   <FileText className="w-4 h-4" />
                                 </button>
                               )}
                               {(item.rawRisk === 'high' || item.rawRisk === 'critical') && (
                                 <button 
                                   onClick={() => handleRequestReassessment(item)}
                                   className="p-2 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg border border-rose-100 transition-all"
                                   title="Request Reassessment"
                                 >
                                   <ClipboardList className="w-4 h-4" />
                                 </button>
                               )}
                             </>
                           ) : (
                             <>
                               <button disabled className="p-2 bg-slate-50 text-slate-200 rounded-lg border border-slate-100 cursor-not-allowed" title="Report available after submission">
                                 <Eye className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => handleSendReminder(item)}
                                 className="p-2 bg-blue-50 text-blue-400 hover:text-blue-600 rounded-lg border border-blue-100 transition-all"
                                 title="Send Reminder"
                               >
                                 <MessageCircle className="w-4 h-4" />
                               </button>
                             </>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {profile.organizationId && (
        <CreateAssessmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          organizationId={profile.organizationId}
          onSuccess={refetch}
        />
      )}

      {/* Details Drawer / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Assessment Details</h2>
                  <p className="text-[12px] text-slate-500 font-medium">Compliance Tracking • {selectedItem.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* Employee Section */}
                <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedItem.employeeName}</h3>
                    <p className="text-[13px] text-slate-500 font-medium">{selectedItem.employeeEmail}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tight">{selectedItem.department}</span>
                      <span className="text-[11px] text-slate-400 font-bold">ID: {selectedItem.id}</span>
                    </div>
                  </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Type</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">{selectedItem.assessmentName}</p>
                        <p className="text-[11px] text-slate-500">Version {selectedItem.assessmentVersion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-tight",
                      selectedItem.rawStatus === 'completed' ? "bg-emerald-50 text-emerald-600" : 
                      selectedItem.rawStatus === 'in_progress' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        selectedItem.rawStatus === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      {selectedItem.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned On</p>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-bold">
                        {selectedItem.assignedAt ? new Date(selectedItem.assignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not recorded'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</p>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className={cn(
                        "text-[13px] font-bold",
                        selectedItem.isOverdue ? "text-rose-600" : "text-slate-900"
                      )}>
                        {selectedItem.dueDate ? new Date(selectedItem.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No due date'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Risk */}
                <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</p>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-black text-slate-900 leading-none">{selectedItem.completion}%</span>
                      <span className="text-[11px] text-slate-500 font-bold mb-1">Processed</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedItem.completion}%` }}
                        className={cn("h-full rounded-full", selectedItem.completion === 100 ? "bg-emerald-500" : "bg-blue-500")} 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-[14px] font-black uppercase tracking-wider shadow-sm",
                        selectedItem.rawRisk === 'low' ? "bg-emerald-500 text-white" : 
                        selectedItem.rawRisk === 'medium' ? "bg-amber-500 text-white" : 
                        selectedItem.rawRisk === 'high' || selectedItem.rawRisk === 'critical' ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        {selectedItem.riskLevel || 'Pending'}
                      </div>
                      {selectedItem.score !== undefined && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                          <p className="text-[13px] font-bold text-slate-900">{selectedItem.score}/100</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Information</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <span className="text-[12px] text-slate-500 font-medium">Assigned By</span>
                      <span className="text-[12px] text-slate-900 font-bold">{selectedItem.assignedBy || 'System Admin'}</span>
                    </div>
                    {selectedItem.completedAt && (
                      <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="text-[12px] text-slate-500 font-medium">Completed On</span>
                        <span className="text-[12px] text-slate-900 font-bold">{new Date(selectedItem.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <span className="text-[12px] text-slate-500 font-medium">Report Available</span>
                      <span className={cn(
                        "text-[12px] font-bold",
                        selectedItem.rawStatus === 'completed' ? "text-emerald-600" : "text-slate-400"
                      )}>{selectedItem.rawStatus === 'completed' ? 'Yes' : 'After submission'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex items-center gap-4">
                {selectedItem.rawStatus === 'completed' ? (
                  <>
                    <Link 
                      href={`/employee/reports/${selectedItem.assessmentId}`}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white text-[13px] font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Assessment Report
                    </Link>
                    {selectedItem.pdfUrl && (
                      <a 
                        href={selectedItem.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => handleSendReminder(selectedItem)}
                    disabled={isReminderSending}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white text-[13px] font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isReminderSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {isReminderSending ? 'Sending Reminder...' : 'Send Completion Reminder'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reminder Success Notification */}
      <AnimatePresence>
        {showReminderSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[13px] font-bold pr-2">Reminder sent successfully.</p>
            <button 
              onClick={() => setShowReminderSuccess(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
