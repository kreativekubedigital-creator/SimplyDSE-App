'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search, 
  Activity, 
  Clock,
  User,
  Download,
  Mail,
  Filter,
  ShieldAlert,
  Fingerprint,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabase';

interface Profile {
  full_name: string;
  email: string;
}

interface Organisation {
  name: string;
}

interface Assessment {
  id: string;
  user_id: string;
  type: string;
  score: number | null;
  risk_level: string | null;
  status: string;
  completed_at: string | null;
  profiles: Profile | null;
  organizations: Organisation | null;
}

export default function ComplianceHubPage() {
  const [activeTab, setActiveTab] = useState<'assessments' | 'security'>('assessments');
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [trackingData, setTrackingData] = useState({
    totalEmployees: 0,
    completed: 0,
    pending: 0,
    notStarted: 0,
    avgScore: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchAssessmentData() {
      try {
        // Fetch assessments with user and org details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select(`
            *,
            profiles (full_name, email),
            organizations (name)
          `)
          .order('created_at', { ascending: false });

        // Fetch total profiles to calculate "Not Started"
        const { count: profileCount, error: profileError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (assessmentData) {
          const typedData = assessmentData as Assessment[];
          setAssessments(typedData);
          
          const completed = typedData.filter(a => a.status === 'completed');
          const pending = typedData.filter(a => a.status === 'pending' || a.status === 'in_progress');
          
          const totalEmp = profileCount || 0;
          // Not started = Total employees - (Completed + Pending)
          // Note: Assuming 1 assessment per employee for now
          const notStarted = Math.max(0, totalEmp - (completed.length + pending.length));

          const avgScore = completed.length > 0 
            ? completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length 
            : 0;
          
          setTrackingData({
            totalEmployees: totalEmp,
            completed: completed.length,
            pending: pending.length,
            notStarted: notStarted,
            avgScore: Math.round(avgScore),
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setTrackingData(prev => ({ ...prev, loading: false }));
      }
    }
    async function fetchSecurityData() {
      try {
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (logs) setSecurityEvents(logs);
      } catch (err) {
        console.error('Error fetching security logs:', err);
      }
    }

    fetchAssessmentData();
    fetchSecurityData();

    const assessSub = supabase
      .channel('compliance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchAssessmentData())
      .subscribe();

    const securitySub = supabase
      .channel('security-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => fetchSecurityData())
      .subscribe();

    return () => {
      supabase.removeChannel(assessSub);
      supabase.removeChannel(securitySub);
    };
  }, []);

  const filteredAssessments = assessments.filter(a => 
    a.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Management</h1>
            <p className="text-[13px] text-slate-500 mt-1">Unified monitoring for regulatory compliance, employee risk assessments, and System security.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Security Audit logs
            </button>
            <button className="px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              Generate Risk Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-slate-100">
          {[
            { id: 'assessments', label: 'Employee Assessments', icon: FileText },
            { id: 'security', label: 'Security Monitoring', icon: ShieldAlert },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-4 text-[13px] font-bold transition-all relative flex items-center gap-2",
                activeTab === tab.id ? "text-brand-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'assessments' ? (
          <>
            {/* Tracking Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Employees" 
                value={trackingData.totalEmployees.toString()} 
                trend="Active" 
                icon={User} 
              />
              <StatCard 
                title="Completed & Graded" 
                value={trackingData.completed.toString()} 
                trend={trackingData.totalEmployees > 0 ? `${Math.round((trackingData.completed / trackingData.totalEmployees) * 100)}%` : "0%"} 
                isPositive={true}
                icon={CheckCircle2} 
              />
              <StatCard 
                title="Pending / In Progress" 
                value={trackingData.pending.toString()} 
                trend="Awaiting submission" 
                icon={Clock} 
              />
              <StatCard 
                title="Average Compliance" 
                value={`${trackingData.avgScore}%`} 
                trend="Platform Score" 
                isPositive={true}
                icon={Shield} 
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* Employee Assessment Roster */}
              <div className="xl:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[18px] font-bold text-slate-900">Assessment Roster</h3>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search records..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-56 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {trackingData.loading ? (
                      <div className="py-12 text-center">
                        <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Syncing Records...</p>
                      </div>
                    ) : filteredAssessments.length > 0 ? (
                      filteredAssessments.map((assessment) => (
                        <div key={assessment.id} className="group border border-slate-100 rounded-2xl p-5 hover:border-brand-primary/20 hover:shadow-md transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                assessment.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                assessment.status === 'in_progress' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                "bg-amber-50 border-amber-100 text-amber-600"
                              )}>
                                {assessment.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                                assessment.status === 'in_progress' ? <Activity className="w-5 h-5" /> : 
                                <Clock className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="text-[14px] font-bold text-slate-900">{assessment.profiles?.full_name || 'Unknown User'}</h4>
                                <p className="text-[12px] text-slate-500">{assessment.profiles?.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              {assessment.status === 'completed' && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                                  <p className="text-[14px] font-bold text-slate-900">{assessment.score}%</p>
                                </div>
                              )}
                              
                              <div className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border text-center w-28",
                                assessment.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                assessment.status === 'in_progress' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                              )}>
                                {assessment.status.replace('_', ' ')}
                              </div>

                              <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                {assessment.status === 'completed' && (
                                  <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all" title="Download Report">
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all" title="Resend Notification">
                                  <Mail className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-[13px] font-bold text-slate-600">No assessments found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="xl:col-span-4 space-y-8">
                <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-brand-secondary" />
                      <h3 className="text-[16px] font-bold">Risk Score Calculation</h3>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      Real-time aggregation of assessment scores to determine global compliance risk across all employee identities.
                    </p>
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400">Platform Health</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Optimal</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400">Avg. Employee Score</span>
                        <span className="font-bold text-white">{trackingData.avgScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <h3 className="text-[15px] font-bold text-slate-900">Regulatory Frameworks</h3>
                  <div className="space-y-4">
                    {['ISO 27001', 'GDPR', 'SOC2 Type II'].map(fw => (
                      <div key={fw} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[12px] font-bold text-slate-700">{fw}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Security Command Feed */}
            <div className="xl:col-span-8 space-y-8">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[18px] font-bold text-slate-900">System Security Health</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {securityEvents.length === 0 ? (
                    <div className="p-20 text-center">
                      <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No security events recorded.</p>
                    </div>
                  ) : (
                    securityEvents.map((log) => {
                      const isCritical = log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('suspend');
                      return (
                        <div key={log.id} className="p-8 hover:bg-slate-50 transition-colors group">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-5">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                                isCritical ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"
                              )}>
                                {isCritical ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-[15px]">{log.action}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{log.entity_type}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1">
                              Audit Hash
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Security Hardening Sidebar */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl space-y-8">
                <h3 className="text-[18px] font-bold">Hardening Status</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Cloud Armor', value: 'Active' },
                    { label: 'DDoS Protection', value: 'Active' },
                    { label: 'SSL/TLS 1.3', value: 'Enabled' },
                    { label: 'Encryption', value: 'AES-256' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[13px] font-medium text-white/70">{item.label}</span>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm text-center space-y-4">
                <Fingerprint className="w-12 h-12 text-brand-primary mx-auto opacity-20" />
                <h4 className="text-[16px] font-bold text-slate-900">Security Score</h4>
                <p className="text-4xl font-black text-slate-900">100/100</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Optimal Hardening</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

