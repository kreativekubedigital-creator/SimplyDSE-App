'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Download, 
  ChevronLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Shield,
  Clock,
  Printer,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single();

      // Fetch assessment record
      const { data: assessment, error: fetchError } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_responses (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!assessment) throw new Error('Assessment not found');

      // Security check: 
      // 1. If employee, must own the assessment
      // 2. If HR (org_admin), must be in the same organization
      const isOwner = assessment.user_id === user.id;
      const isHR = profile?.role === 'org_admin' || profile?.role === 'organization_admin';
      const sameOrg = assessment.organization_id === profile?.organization_id;

      if (!isOwner && !(isHR && sameOrg)) {
        throw new Error('Unauthorized access to this report');
      }

      if (assessment.status !== 'completed') {
        setError('This assessment has not been completed yet.');
        setLoading(false);
        return;
      }

      // Parse results summary
      const summary = typeof assessment.results_summary === 'string' 
        ? JSON.parse(assessment.results_summary) 
        : assessment.results_summary;

      setReportData({
        ...assessment,
        summary,
        viewerRole: profile?.role
      });
      
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (reportData?.metadata?.pdf_report_url) {
      window.open(reportData.metadata.pdf_report_url, '_blank');
      return;
    }

    // Trigger generation if not exists
    try {
      setGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      const response = await fetch('/api/generate-assessment-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: reportData.id,
          organizationId: profile?.organizations?.id,
          userId: user.id,
          employeeName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Employee',
          companyName: profile?.organizations?.name || 'Organisation',
          assessmentDate: new Date(reportData.created_at).toLocaleDateString(),
          overallScore: reportData.summary?.score || reportData.score || 0,
          overallRiskLevel: reportData.risk_level || 'Low',
          categories: reportData.summary?.categories || [],
          strengths: reportData.summary?.strengths || [],
          improvements: reportData.summary?.improvements || [],
          recommendations: reportData.summary?.recommendations || [],
          employeeEmail: user.email
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      const result = await response.json();
      
      // Update local state with new PDF URL
      setReportData((prev: any) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          pdf_report_url: result.pdfUrl
        }
      }));

      window.open(result.pdfUrl, '_blank');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF. Please try again later.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Analysing assessment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Report Unavailable</h1>
        <p className="text-slate-500 text-center max-w-md mb-8">{error}</p>
        <button 
          onClick={() => router.push('/employee/assessments')}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const riskColor = reportData.risk_level?.toLowerCase() === 'critical' ? 'rose' : 
                    reportData.risk_level?.toLowerCase() === 'high' ? 'amber' : 
                    reportData.risk_level?.toLowerCase() === 'medium' ? 'blue' : 'emerald';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              const isHR = reportData?.viewerRole === 'org_admin' || reportData?.viewerRole === 'organization_admin';
              router.push(isHR ? '/dashboard/compliance' : '/employee/assessments');
            }}
            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-2 rounded-lg group-hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold">Back to {reportData?.viewerRole?.includes('admin') ? 'Compliance' : 'Assessments'}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Printer className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={generating}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50",
              )}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {generating ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest">
                Official Report
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest",
                riskColor === 'rose' ? "bg-rose-100 text-rose-700" :
                riskColor === 'amber' ? "bg-amber-100 text-amber-700" :
                riskColor === 'blue' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {reportData.risk_level} Risk Level
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Hybrid DSE Assessment Report</h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mb-10 leading-relaxed">
              This report provides a comprehensive analysis of your workstation ergonomics, health risks, and professional recommendations for improvement.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Assessment Date</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {new Date(reportData.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Report ID</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold uppercase">
                  <Shield className="w-4 h-4 text-blue-500" />
                  {reportData.id.slice(0, 8)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Score Rating</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    riskColor === 'rose' ? "bg-rose-500" :
                    riskColor === 'amber' ? "bg-amber-500" :
                    riskColor === 'blue' ? "bg-blue-500" : "bg-emerald-500"
                  )} />
                  {reportData.summary?.score || reportData.score || 0}/100
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status</p>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Category Scores */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                Category Performance
              </h2>
              
              <div className="space-y-6">
                {reportData.summary?.categories?.map((cat: any) => (
                  <div key={cat.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-bold text-slate-700">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                          cat.riskLevel === 'critical' ? "bg-rose-50 text-rose-600" :
                          cat.riskLevel === 'high' ? "bg-amber-50 text-amber-600" :
                          cat.riskLevel === 'medium' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {cat.riskLevel}
                        </span>
                        <span className="text-[14px] font-black text-slate-900">
                          {Math.round((cat.score / (cat.maxScore || 20)) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((cat.score / (cat.maxScore || 20)) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          cat.riskLevel === 'critical' ? "bg-rose-500" :
                          cat.riskLevel === 'high' ? "bg-amber-500" :
                          cat.riskLevel === 'medium' ? "bg-blue-500" : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Detailed Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
                <h2 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  Key Strengths
                </h2>
                <ul className="space-y-4">
                  {(reportData.summary?.strengths?.length > 0 ? reportData.summary.strengths : [
                    'Correct seating height maintained',
                    'Adequate workspace lighting',
                    'Equipment in good working condition'
                  ]).map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-[13px] text-slate-600 leading-relaxed">
                      <span className="text-emerald-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
                <h2 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-3 text-rose-600">
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  Areas for Improvement
                </h2>
                <ul className="space-y-4">
                  {(reportData.summary?.improvements?.length > 0 ? reportData.summary.improvements : [
                    'Review monitor eye-level alignment',
                    'Increase frequency of micro-breaks',
                    'Adjust keyboard positioning'
                  ]).map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-[13px] text-slate-600 leading-relaxed">
                      <span className="text-rose-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 sticky top-24">
              <h2 className="text-xl font-bold mb-8">Recommendations</h2>
              <div className="space-y-8">
                {(reportData.summary?.recommendations?.length > 0 ? reportData.summary.recommendations : [
                  'Complete the ergonomic workstation training module.',
                  'Set reminders for a 5-minute break every hour.',
                  'Consider a footrest to improve lower back support.'
                ]).map((item: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[13px] text-slate-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => router.push('/employee/assessments?tab=resources')}
                className="w-full mt-12 py-4 bg-white text-slate-900 rounded-[1.25rem] text-[13px] font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
              >
                Access Resource Library
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </section>
            
            <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
              <p className="text-[12px] font-bold text-blue-900 mb-2 uppercase tracking-widest">Next Steps</p>
              <p className="text-[13px] text-blue-800 leading-relaxed">
                Your next workstation review is scheduled for 12 months from today. You can retake this assessment at any time if your workspace changes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
