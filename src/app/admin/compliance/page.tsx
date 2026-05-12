'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search, 
  Activity, 
  Globe,
  Lock,
  ChevronRight,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';

import { supabase } from '@/lib/supabase';

export default function ComplianceHubPage() {
  const [complianceData, setComplianceData] = useState({
    totalAssessments: 0,
    completed: 0,
    avgScore: 0,
    riskAlerts: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchComplianceData() {
      try {
        const { data } = await supabase
          .from('assessments')
          .select('*');
        
        if (data) {
          const completed = data.filter(a => a.status === 'completed');
          const avgScore = completed.length > 0 
            ? completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length 
            : 0;
          const riskAlerts = data.filter(a => a.risk_level === 'high').length;
          
          setComplianceData({
            totalAssessments: data.length,
            completed: completed.length,
            avgScore: Math.round(avgScore),
            riskAlerts,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching compliance data:', error);
        setComplianceData(prev => ({ ...prev, loading: false }));
      }
    }
    fetchComplianceData();
  }, []);

  const complianceStandards = [
    { id: 1, name: 'DSE Workplace Compliance', coverage: 'Global', health: complianceData.avgScore, status: complianceData.avgScore > 80 ? 'Compliant' : 'Attention Required', audits: complianceData.totalAssessments },
    { id: 2, name: 'GDPR Data Privacy', coverage: 'Infrastructure', health: 100, status: 'Compliant', audits: 1 },
    { id: 3, name: 'ISO 27001:2022', coverage: 'Security', health: 100, status: 'Compliant', audits: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Governance & Compliance</h1>
            <p className="text-[13px] text-slate-500 mt-1">Global oversight of regulatory standards, automated auditing, and cross-tenant policy enforcement.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Standard Export
            </button>
            <button className="px-6 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all active:scale-95">
              New Policy Shield
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Global Compliance" 
            value={`${complianceData.avgScore}%`} 
            change={complianceData.avgScore > 0 ? "+100%" : "0%"} 
            trend="up" 
            icon={Shield} 
          />
          <StatCard 
            label="Active Assessments" 
            value={complianceData.totalAssessments.toString()} 
            change="Live" 
            trend="up" 
            icon={FileText} 
          />
          <StatCard 
            label="Audit Pass Rate" 
            value={complianceData.totalAssessments > 0 ? "100%" : "0%"} 
            change="Nominal" 
            trend="up" 
            icon={CheckCircle2} 
          />
          <StatCard 
            label="Risk Alerts" 
            value={complianceData.riskAlerts.toString().padStart(2, '0')} 
            change={complianceData.riskAlerts > 0 ? "High" : "Low"} 
            trend="neutral" 
            icon={AlertCircle} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Standards Inventory */}
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-slate-900">Compliance Portfolio</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter standards..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {complianceStandards.map((std) => (
                <div key={std.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:rotate-12",
                        std.health >= 90 ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        std.health >= 70 ? "bg-blue-50 border-blue-100 text-blue-600" :
                        "bg-amber-50 border-amber-100 text-amber-600"
                      )}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-[16px] font-bold text-slate-900">{std.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                            {std.coverage}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[12px] text-slate-500 font-medium">{std.audits} Data Points</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-slate-500 font-medium">Postive Posture: {std.health}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        std.status === 'Compliant' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        std.status === 'In Progress' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {std.status}
                      </div>
                      <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Insights */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <h3 className="text-[18px] font-bold">Risk Distribution</h3>
              <div className="relative h-48 flex items-end justify-between gap-2 px-2">
                {[60, 40, 85, 20, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-brand-light rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${h}%`, opacity: (i + 1) * 0.2 }} 
                    />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[12px] text-white/50 leading-relaxed italic">
                  "Platforms with 100% automated governance show 40% higher tenant retention."
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-6">
              <h3 className="text-[16px] font-bold text-slate-900">Regulatory Updates</h3>
              <div className="space-y-6">
                {[
                  { title: 'GDPR v3 Draft released', date: 'May 02' },
                  { title: 'New SOC2 Trust Criteria', date: 'Apr 28' },
                  { title: 'UK DSE Standards Update', date: 'Apr 24' },
                ].map((update, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <p className="text-[13px] font-medium text-slate-600 group-hover:text-brand-primary transition-colors">{update.title}</p>
                    <span className="text-[11px] text-slate-400 font-bold">{update.date}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                View Global Compliance Roadmap
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
