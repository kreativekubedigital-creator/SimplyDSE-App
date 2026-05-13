'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getReassessmentInterval } from '@/lib/assessment-engine';

export default function AssessmentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [assessment, setAssessment] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const resolvedParams = await params;
      const { data } = await supabase
        .from('assessments')
        .select('*, profiles(*), organizations(*)')
        .eq('id', resolvedParams.id)
        .single();

      if (data && data.results_summary) {
        setAssessment(data);
        setResults(JSON.parse(data.results_summary));
      }
      setLoading(false);
    }
    fetchReport();
  }, [params]);

  if (loading) return null;

  const radarData = Object.entries(results.categoryScores || {}).map(([name, score]) => ({
    subject: name,
    A: score,
    fullMark: 100,
  }));

  const riskInfo = {
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, text: 'Low Risk - Compliant' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertTriangle, text: 'Medium Risk - Monitor' },
    high: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle, text: 'High Risk - Action Required' },
    critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, text: 'Critical Risk - Urgent Escalation' },
  }[results.riskLevel as 'low' | 'medium' | 'high' | 'critical'] || riskInfo.low;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Report Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Workplace Assessment Report</h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all backdrop-blur-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</p>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-400" />
                <p className="font-bold text-lg">{assessment.profiles?.full_name}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organisation</p>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-blue-400" />
                <p className="font-bold text-lg">{assessment.organizations?.name}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment Date</p>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-400" />
                <p className="font-bold text-lg">{new Date(assessment.completed_at).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Body */}
      <div className="max-w-5xl mx-auto -mt-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Risk Summary Card */}
            <div className={cn("bg-white rounded-3xl border p-8 shadow-xl shadow-slate-900/5", riskInfo.border)}>
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", riskInfo.bg, riskInfo.color)}>
                    <riskInfo.icon className="w-4 h-4" />
                    {riskInfo.text}
                  </div>
                  <h2 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
                    Your assessment score is {results.score}/100
                  </h2>
                  <p className="text-slate-500 text-[15px] leading-relaxed max-w-md">
                    We have analysed your workstation ergonomics and compliance metadata. 
                    {results.riskLevel === 'low' 
                      ? ' Your setup meets standard safety requirements.' 
                      : ' Some areas require adjustment to ensure your long-term health and safety.'}
                  </p>
                </div>
                <div className="hidden sm:block text-center space-y-2">
                   <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-900">{results.score}</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Index</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-8">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personalised Recommendations</h3>
              </div>
              <div className="space-y-4">
                {results.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[13px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-[14px] font-medium text-slate-700 leading-snug">{rec}</p>
                  </div>
                ))}
                {results.recommendations.length === 0 && (
                   <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium text-slate-500">No critical recommendations identified. Good job!</p>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Radar Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-900/5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Performance Matrix</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#2563EB"
                      fill="#2563EB"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/10">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Compliance Status</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-2xl font-bold">{getReassessmentInterval(results.riskLevel)}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Until next mandatory reassessment</p>
                </div>
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium">Data stored in Audit Logs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium">Synced with HR Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
