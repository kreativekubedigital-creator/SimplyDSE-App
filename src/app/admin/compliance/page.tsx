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
  Filter
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';
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
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [trackingData, setTrackingData] = useState({
    totalEmployees: 0,
    completed: 0,
    pending: 0,
    notStarted: 0,
    avgScore: 0,
    loading: true
  });
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchAssessmentData();

    const assessSub = supabase
      .channel('compliance-assessment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => {
        fetchAssessmentData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(assessSub);
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Tracking</h1>
            <p className="text-[13px] text-slate-500 mt-1">Monitor employee compliance, trigger automated grading, and manage report distribution.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Remind Pending
            </button>
            <button className="px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              Generate Global Report
            </button>
          </div>
        </div>

        {/* Tracking Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Employees" 
            value={trackingData.totalEmployees.toString()} 
            change="Active" 
            trend="neutral" 
            icon={User} 
          />
          <StatCard 
            label="Completed & Graded" 
            value={trackingData.completed.toString()} 
            change={trackingData.totalEmployees > 0 ? `${Math.round((trackingData.completed / trackingData.totalEmployees) * 100)}%` : "0%"} 
            trend="up" 
            icon={CheckCircle2} 
          />
          <StatCard 
            label="Pending / In Progress" 
            value={trackingData.pending.toString()} 
            change="Awaiting submission" 
            trend="neutral" 
            icon={Clock} 
          />
          <StatCard 
            label="Not Started" 
            value={trackingData.notStarted.toString()} 
            change="Requires action" 
            trend="down" 
            icon={AlertCircle} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Employee Assessment Roster */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[18px] font-bold text-slate-900">Employee Assessment Roster</h3>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-56 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                    />
                  </div>
                  <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {trackingData.loading ? (
                  <div className="py-12 text-center">
                    <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
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
                    <p className="text-[11px] text-slate-400 mt-1">Users have not yet initiated their compliance checks.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grading & Reporting Logic Sandbox */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-brand-secondary" />
                  <h3 className="text-[16px] font-bold">Automated Grading Engine</h3>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Upon assessment submission, the system automatically grades responses, calculates a risk score, and triggers a personalized email report to the employee.
                </p>
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400">Processing Status</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400">Reports Generated</span>
                    <span className="font-bold text-white">{trackingData.completed}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400">Emails Dispatched</span>
                    <span className="font-bold text-white">{trackingData.completed}</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[11px] font-bold uppercase tracking-widest border border-white/10">
                  Configure Logic Rules
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-[15px] font-bold text-slate-900">Pending Actions</h3>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-amber-900">Awaiting Assessment Questions</h4>
                    <p className="text-[11px] text-amber-700/80 mt-1 leading-relaxed">
                      The grading engine is ready to accept your custom assessment criteria. Once uploaded, the system will map user responses to risk thresholds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

