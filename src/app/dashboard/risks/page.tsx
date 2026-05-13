'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  MessageCircle, 
  History,
  MoreVertical,
  ChevronRight,
  Filter,
  Search,
  Flag,
  User,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function RisksPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    consultations: 0
  });

  useEffect(() => {
    async function fetchRisks() {
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

        const { data: records, error } = await supabase
          .from('assessments')
          .select(`
            *,
            profiles(full_name, email)
          `)
          .eq('organization_id', profile.organization_id)
          .in('risk_level', ['high', 'medium'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        const processedIncidents = records.map((rec: any) => ({
          id: rec.id.substring(0, 8).toUpperCase(),
          employee: rec.profiles?.full_name || rec.profiles?.email || 'Unnamed',
          department: 'General',
          risk: rec.risk_level === 'high' ? 'Critical' : 'High',
          issue: rec.results_summary || 'Risk detected in recent assessment',
          date: new Date(rec.created_at).toLocaleDateString(),
          status: rec.status === 'completed' ? 'Resolved' : 'Under Review'
        }));

        setIncidents(processedIncidents);

        setStats({
          critical: processedIncidents.filter((i: any) => i.risk === 'Critical').length,
          high: processedIncidents.filter((i: any) => i.risk === 'High').length,
          consultations: 0 // Placeholder
        });

      } catch (err) {
        console.error('Error fetching risks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRisks();
  }, []);

  const filteredIncidents = incidents.filter((i: any) => 
    i.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">Risks & Escalations</h2>
          <p className="text-[12px] text-slate-700 font-medium">Manage urgent ergonomic risks and automated compliance escalations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-[12px] font-semibold hover:bg-slate-50 transition-all">
            <History className="w-4 h-4" />
            Risk History
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-[12px] font-semibold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
            <ShieldAlert className="w-4 h-4" />
            Manual Escalation
          </button>
        </div>
      </div>

      {/* Risk Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">Critical Issues</p>
              <h4 className="text-2xl font-bold text-slate-900">{stats.critical}</h4>
            </div>
          </div>
          <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
            Require immediate intervention based on high-risk assessment results.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">High Priority</p>
              <h4 className="text-2xl font-bold text-slate-900">{stats.high}</h4>
            </div>
          </div>
          <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
            Medium risk cases assigned for safety review and follow-up.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-widest">Open Consultations</p>
              <h4 className="text-2xl font-bold text-slate-900">{stats.consultations}</h4>
            </div>
          </div>
          <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
            Active dialogues between employees and health safety officers.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Incidents List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-slate-900">Active Risk Incidents</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input 
                  type="text" 
                  placeholder="Search incidents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 text-slate-800" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-20 text-center flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-500">Fetching risk incidents...</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-3 text-slate-400">
                  <Flag className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">No active risk incidents found.</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <div key={incident.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        incident.risk === 'Critical' ? "bg-rose-50 text-rose-600" :
                        incident.risk === 'High' ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        <Flag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-slate-900">{incident.employee}</span>
                          <span className="text-[11px] text-slate-700 font-medium">• {incident.id}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight",
                            incident.risk === 'Critical' ? "bg-rose-500 text-white" :
                            incident.risk === 'High' ? "bg-amber-500 text-white" :
                            "bg-blue-500 text-white"
                          )}>
                            {incident.risk}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-800 font-medium mt-1">{incident.issue}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-700 font-semibold">
                            <User className="w-3 h-3" />
                            {incident.department}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-700 font-semibold">
                            <Clock className="w-3 h-3" />
                            {incident.date}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            incident.status === 'Resolved' ? "text-emerald-600" : "text-blue-600"
                          )}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-[11px] font-semibold transition-all">
                        Investigate
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Escalation Workflows */}
        <div className="space-y-6">
          <h3 className="text-[16px] font-semibold text-slate-900">Active Escalations</h3>
          <div className="bg-slate-900 rounded-[1.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h4 className="text-[18px] font-bold mb-2">Automated Escalation</h4>
              <p className="text-slate-300 text-[12px] leading-relaxed mb-6">
                5 High-Risk cases have been automatically escalated to Occupational Health due to 48h non-response.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-300">Engineering</span>
                  <span className="text-[11px] font-semibold text-rose-400">3 Cases</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <span className="text-[11px] font-medium text-slate-300">Operations</span>
                  <span className="text-[11px] font-semibold text-rose-400">2 Cases</span>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-[12px] font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                Review Escalation Chain
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full group-hover:bg-blue-600/20 transition-all" />
          </div>

          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 shadow-sm">
            <h4 className="text-[14px] font-semibold text-slate-900 mb-6">Risk Severity Legend</h4>
            <div className="space-y-4">
              <LegendItem color="bg-rose-500" label="Critical" desc="Immediate intervention required" />
              <LegendItem color="bg-amber-500" label="High" desc="Review within 24-48 hours" />
              <LegendItem color="bg-blue-500" label="Medium" desc="Monitor and follow-up" />
              <LegendItem color="bg-emerald-500" label="Low" desc="Standard maintenance" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, desc }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", color)} />
      <div>
        <p className="text-[12px] font-semibold text-slate-900 leading-none">{label}</p>
        <p className="text-[11px] text-slate-700 font-medium mt-1">{desc}</p>
      </div>
    </div>
  );
}
