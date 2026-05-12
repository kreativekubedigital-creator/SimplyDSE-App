'use client';

import React from 'react';
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
  ToggleLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activeWorkflows = [
  { id: 'WF-001', name: 'Annual Re-assessment', type: 'Recurring', trigger: 'Every 12 months', status: 'Running', nextRun: 'Jun 01, 2024', active: true },
  { id: 'WF-002', name: 'High-Risk Escalation', type: 'Incident', trigger: 'Risk Level = High', status: 'Active', nextRun: 'Real-time', active: true },
  { id: 'WF-003', name: 'New Employee Onboarding', type: 'Automation', trigger: 'New User Created', status: 'Running', nextRun: 'Real-time', active: true },
  { id: 'WF-004', name: 'Overdue Reminder Chain', type: 'Reminder', trigger: 'Status = Overdue', status: 'Paused', nextRun: 'N/A', active: false },
  { id: 'WF-005', name: 'Departmental Audit', type: 'Manual', trigger: 'Manual Trigger', status: 'Scheduled', nextRun: 'Jul 15, 2024', active: true },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Workflow Automation</h2>
          <p className="text-[14px] text-slate-500 font-medium">Configure and manage automated compliance sequences, reminders, and escalation chains.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all">
            <Clock className="w-4 h-4" />
            Execution Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">24</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Automated sequences</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Successful</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">1,842</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Actions this month</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">156</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Waiting for approval</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Escalated</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">12</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Active escalations</p>
        </div>
      </div>

      {/* Active Workflows Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Active Sequences</h3>
          <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">View All Workflows</button>
        </div>
        <div className="overflow-x-auto">
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
              {activeWorkflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <GitBranch className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">{wf.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">{wf.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[12px] font-semibold text-slate-600">{wf.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[12px] font-medium text-slate-600">{wf.trigger}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                      wf.status === 'Running' ? "bg-emerald-50 text-emerald-600" :
                      wf.status === 'Paused' ? "bg-slate-100 text-slate-500" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {wf.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[13px] font-bold text-slate-900">
                    {wf.nextRun}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className={cn(
                        "p-1.5 rounded-md transition-all",
                        wf.active ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100"
                      )}>
                        <ToggleLeft className={cn("w-6 h-6", wf.active ? "rotate-180" : "")} />
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
        </div>
      </div>

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
