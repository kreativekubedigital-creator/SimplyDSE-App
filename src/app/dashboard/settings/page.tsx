'use client';

import React from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Users, 
  GitBranch, 
  Lock, 
  Building2, 
  Globe, 
  Mail, 
  Database, 
  Save,
  CheckCircle2,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Organisation Settings</h2>
          <p className="text-[14px] text-slate-500 font-medium">Configure Organisation-wide compliance rules, notification preferences, and team permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
          <Save className="w-4.5 h-4.5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <SettingsTab icon={Building2} label="General" active />
          <SettingsTab icon={ShieldCheck} label="Compliance Rules" />
          <SettingsTab icon={GitBranch} label="Workflow Logic" />
          <SettingsTab icon={Bell} label="Notifications" />
          <SettingsTab icon={Users} label="User Management" />
          <SettingsTab icon={Lock} label="Security & API" />
          <SettingsTab icon={Database} label="Data & Retention" />
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {/* General Section */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">General Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Organisation Name" placeholder="TechCorp Ltd." />
                <InputGroup label="Industry" placeholder="Technology / SaaS" />
              </div>
              <InputGroup label="Primary Domain" placeholder="techcorp.com" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Language</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>English (UK)</option>
                    <option>English (US)</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Timezone</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>London (GMT)</option>
                    <option>New York (EST)</option>
                    <option>San Francisco (PST)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance Configuration */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Compliance Defaults</h3>
            <p className="text-[13px] text-slate-400 font-medium mb-8">Set global defaults for assessments and risk thresholds.</p>
            
            <div className="space-y-6">
              <ToggleItem 
                title="Mandatory Annual Review" 
                desc="Automatically assign new DSE assessments every 12 months."
                active
              />
              <ToggleItem 
                title="Automated Escalation" 
                desc="Escalate high-risk assessments to HR if unresolved after 48h."
                active
              />
              <ToggleItem 
                title="Employee Peer Review" 
                desc="Allow team leads to review their department's compliance status."
              />
              
              <div className="pt-6 border-t border-slate-50">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Risk Threshold (%)</label>
                <div className="flex items-center gap-4 mt-4">
                  <input type="range" className="flex-1 accent-blue-600" />
                  <span className="w-12 text-center font-bold text-slate-900">75%</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-2">Scores below this value will trigger a 'High Risk' status.</p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-rose-50/50 border border-rose-100 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold text-rose-900 mb-2">Danger Zone</h3>
            <p className="text-[13px] text-rose-600/60 font-medium mb-8">Irreversible actions that affect Organisation data.</p>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl hover:bg-rose-100/50 transition-all group">
                <div className="text-left">
                  <p className="text-[14px] font-bold text-rose-900">Archive All Data</p>
                  <p className="text-[11px] text-rose-600/60 font-medium mt-1">Export and move all current data to historical storage.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white border border-rose-100 rounded-2xl hover:bg-rose-100/50 transition-all group">
                <div className="text-left">
                  <p className="text-[14px] font-bold text-rose-900">Delete Organisation</p>
                  <p className="text-[11px] text-rose-600/60 font-medium mt-1">Permanently remove all data and Organisation settings.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active }: any) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
      active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
        <span className="text-[14px] font-bold">{label}</span>
      </div>
      <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all", active && "opacity-100")} />
    </button>
  );
}

function InputGroup({ label, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function ToggleItem({ title, desc, active }: any) {
  return (
    <div className="flex items-start justify-between gap-4 p-1">
      <div className="flex-1">
        <p className="text-[14px] font-bold text-slate-900">{title}</p>
        <p className="text-[12px] text-slate-500 font-medium mt-1">{desc}</p>
      </div>
      <button className={cn(
        "w-12 h-6 rounded-full relative transition-all duration-300 shrink-0",
        active ? "bg-blue-600" : "bg-slate-200"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
          active ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
