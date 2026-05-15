'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  Bell, 
  ShieldAlert, 
  RotateCcw, 
  Play, 
  Settings2,
  MoreVertical,
  Plus,
  CheckCircle2,
  ArrowRight,
  Zap,
  ToggleLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { 
  getWorkflowRules, 
  getWorkflowMetrics, 
  toggleWorkflowRule 
} from '@/app/actions/workflow-actions';
import { CreateWorkflowModal } from '@/components/dashboard/Workflows/CreateWorkflowModal';
import { ExecutionLogsModal } from '@/components/dashboard/Workflows/ExecutionLogsModal';

export default function WorkflowsPage() {
  const { organizationId } = useProfile();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    active: 0,
    successful: 0,
    pending: 0,
    escalated: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  async function loadData() {
    setLoading(true);
    const [rulesRes, metricsRes] = await Promise.all([
      getWorkflowRules(organizationId!),
      getWorkflowMetrics(organizationId!)
    ]);

    if (rulesRes.success) setWorkflows(rulesRes.data || []);
    if (metricsRes.success && metricsRes.metrics) setMetrics(metricsRes.metrics);
    setLoading(false);
  }

  const handleToggle = async (ruleId: string, currentState: boolean) => {
    setTogglingId(ruleId);
    const res = await toggleWorkflowRule(ruleId, !currentState);
    if (res.success) {
      setWorkflows(prev => prev.map(w => 
        w.id === ruleId ? { ...w, is_enabled: !currentState, status: !currentState ? 'active' : 'paused' } : w
      ));
      // Refresh metrics
      const mRes = await getWorkflowMetrics(organizationId!);
      if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
    }
    setTogglingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Workflow Automation</h2>
          <p className="text-[14px] text-slate-500 font-medium">Configure and manage automated compliance sequences, reminders, and escalation chains.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsLogsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all"
          >
            <Clock className="w-4 h-4" />
            Execution Logs
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={Zap} label="Active" value={metrics.active} sub="Automated sequences" color="blue" loading={loading} />
        <MetricCard icon={CheckCircle2} label="Successful" value={metrics.successful.toLocaleString()} sub="Actions this month" color="emerald" loading={loading} />
        <MetricCard icon={Bell} label="Pending" value={metrics.pending} sub="Waiting for approval" color="amber" loading={loading} />
        <MetricCard icon={ShieldAlert} label="Escalated" value={metrics.escalated} sub="Active escalations" color="rose" loading={loading} />
      </div>

      {/* Active Workflows Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Active Sequences</h3>
          <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">View All Workflows</button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No workflows have been created yet</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Create your first workflow
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workflow Name</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trigger Condition</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Next Execution</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <GitBranch className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 leading-none">{wf.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">ID: {wf.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[12px] font-semibold text-slate-600 capitalize">
                        {wf.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[12px] font-medium text-slate-600 truncate max-w-[150px]">
                          {wf.trigger_condition?.field ? `${wf.trigger_condition.field} > ${wf.trigger_condition.value}` : 'Manual Trigger'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                        wf.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                        wf.status === 'paused' ? "bg-slate-100 text-slate-500" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-900">
                      {wf.next_execution_at ? new Date(wf.next_execution_at).toLocaleDateString('en-GB') : 'Real-time'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleToggle(wf.id, wf.is_enabled)}
                          disabled={togglingId === wf.id}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            wf.is_enabled ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100"
                          )}
                        >
                          {togglingId === wf.id ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <ToggleLeft className={cn("w-6 h-6", wf.is_enabled ? "rotate-180" : "")} />
                          )}
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateWorkflowModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        organizationId={organizationId!} 
        onSuccess={loadData}
      />
      <ExecutionLogsModal 
        isOpen={isLogsModalOpen} 
        onClose={() => setIsLogsModalOpen(false)} 
        organizationId={organizationId!} 
      />

      {/* Workflow Builder Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Build Custom Automation</h3>
            <p className="text-slate-400 text-[14px] leading-relaxed mb-10 max-w-md">
              Create complex multi-step workflows with conditional logic to handle compliance events automatically.
            </p>
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">1</div>
                <div className="flex-1 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1">Trigger</p>
                  <p className="text-[14px] font-bold">Assessment Overdue by 48 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">2</div>
                <div className="flex-1 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">Action</p>
                  <p className="text-[14px] font-bold">Send Slack & Email Reminder</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">3</div>
                <div className="flex-1 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-1">Condition</p>
                  <p className="text-[14px] font-bold">If no response, escalate to Manager</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-[15px] font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20">
              Open Workflow Designer
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <GitBranch className="w-64 h-64" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Automation Templates</h3>
              <p className="text-[13px] text-slate-400 font-medium">Pre-configured enterprise workflows</p>
            </div>
            <Settings2 className="w-6 h-6 text-slate-300" />
          </div>
          <div className="space-y-4">
            <TemplateItem icon={RotateCcw} title="Annual Review Loop" desc="Automates the 12-month compliance cycle." />
            <TemplateItem icon={Bell} title="The 'Gentle Nudge'" desc="Sends subtle reminders before deadlines." />
            <TemplateItem icon={ShieldAlert} title="Risk Rapid Response" desc="Triggers OH intervention for high risk scores." />
            <TemplateItem icon={Play} title="Auto-Onboarding" desc="Instantly assigns tasks to new employees." />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color, loading }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100"
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm group hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
      )}
      <p className="text-[11px] text-slate-400 font-medium mt-1">{sub}</p>
    </div>
  );
}

function TemplateItem({ icon: Icon, title, desc }: any) {
  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group">
      <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-900 leading-none">{title}</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1.5">{desc}</p>
      </div>
    </button>
  );
}
