'use client';

import React from 'react';
import { 
  Workflow, 
  Play, 
  Settings, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  Split,
  Layers
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';

const activeWorkflows = [
  { id: 1, name: 'Workspace Auto-Provisioning', status: 'Running', health: '99%', type: 'System', steps: 8 },
  { id: 2, name: 'Security Audit Synchronization', status: 'Scheduled', health: '100%', type: 'Security', steps: 4 },
  { id: 3, name: 'Assessment Compliance Score Aggregation', status: 'Running', health: '94%', type: 'Analytics', steps: 12 },
  { id: 4, name: 'Backup & Disaster Recovery Trigger', status: 'Standby', health: '100%', type: 'System', steps: 6 },
  { id: 5, name: 'Automated Employee Onboarding', status: 'Paused', health: 'N/A', type: 'IAM', steps: 5 },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Workflows & Automation</h1>
            <p className="text-[13px] text-slate-500 mt-1">Orchestrate cross-Workspace automated processes, System triggers, and data pipelines.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Active Workflows" 
            value="42" 
            change="+3" 
            trend="up" 
            icon={Zap} 
          />
          <StatCard 
            label="Execution Health" 
            value="98.2%" 
            change="+0.5%" 
            trend="up" 
            icon={Activity} 
          />
          <StatCard 
            label="Total Executions" 
            value="1.2M" 
            change="+240k" 
            trend="up" 
            icon={Play} 
          />
          <StatCard 
            label="Avg. Duration" 
            value="1.4s" 
            change="-0.2s" 
            trend="up" 
            icon={Clock} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Workflow List */}
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-slate-900">Process Inventory</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter workflows..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeWorkflows.map((wf) => (
                <div key={wf.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform",
                        wf.status === 'Running' ? "bg-brand-primary/5 border-brand-primary/10 text-brand-primary" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        <Workflow className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-[16px] font-bold text-slate-900">{wf.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                            {wf.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[12px] text-slate-500 font-medium">{wf.steps} Steps</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[12px] text-slate-500 font-medium">{wf.health} Success Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        wf.status === 'Running' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        wf.status === 'Scheduled' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {wf.status}
                      </div>
                      <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow Insights */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8">
              <h3 className="text-[18px] font-bold">Execution Heatmap</h3>
              <div className="space-y-6">
                {[
                  { label: 'Provisioning', val: 98 },
                  { label: 'Compliance Data', val: 84 },
                  { label: 'Identity Sync', val: 99 },
                  { label: 'Cloud Events', val: 92 },
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest">
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-brand-light">{item.val}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-light rounded-full transition-all duration-1000" 
                        style={{ width: `${item.val}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-6">
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[14px] font-bold text-amber-900">Degraded Workflow</p>
                  <p className="text-[12px] text-amber-700/70 mt-1 leading-relaxed">
                    Compliance Data pipeline is experiencing higher than normal latency (2.4s).
                  </p>
                </div>
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                System Diagnostics
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
