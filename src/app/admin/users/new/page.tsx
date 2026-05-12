'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Building2, 
  Globe, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: 'employee',
    accessLevel: 'standard'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <Link href="/admin/users" className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-brand-primary transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Directory
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Onboard Global Identity</h1>
            <p className="text-[13px] text-slate-500">Provision a new user account and assign hierarchical access controls.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900">Identity Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Full Legal Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Johnathan Smith"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Enterprise Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="john@company.com"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Assign to Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <select className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none appearance-none focus:ring-4 focus:ring-brand-primary/5 transition-all">
                    <option>Select Tenant Environment</option>
                    <option>TechCorp Global</option>
                    <option>EduStream Inc</option>
                    <option>Nexus Health</option>
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900">Access Governance</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'super_admin', name: 'Super Admin', desc: 'Global Platform Control' },
                  { id: 'org_admin', name: 'Org Admin', desc: 'Tenant Management' },
                  { id: 'assessor', name: 'Assessor', desc: 'Compliance Workflow' },
                  { id: 'employee', name: 'Employee', desc: 'Standard Access' },
                ].map((role) => (
                  <button 
                    key={role.id}
                    className={cn(
                      "flex flex-col items-start p-6 rounded-3xl border text-left transition-all group",
                      formData.role === role.id ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-white border-slate-100 hover:border-brand-primary/20"
                    )}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mb-4 transition-colors",
                      formData.role === role.id ? "bg-white/20" : "bg-slate-50 group-hover:bg-brand-primary/5"
                    )}>
                      <Shield className={cn("w-4 h-4", formData.role === role.id ? "text-white" : "text-slate-400 group-hover:text-brand-primary")} />
                    </div>
                    <p className="font-bold text-[14px]">{role.name}</p>
                    <p className={cn("text-[11px] mt-1", formData.role === role.id ? "text-white/70" : "text-slate-400")}>{role.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-2xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button className="px-10 py-4 bg-brand-primary text-white text-[13px] font-bold rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                Send Invitation & Provision
              </button>
            </div>
          </div>

          {/* Side Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20 space-y-8 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-[18px] font-bold">Policy Enforcement</h3>
                  <p className="text-white/50 text-[13px]">Identity security guardrails.</p>
                </div>

                <div className="space-y-5">
                  {[
                    { label: 'MFA Required', active: true },
                    { label: 'Domain Restricted', active: true },
                    { label: 'Auto-Expiring Link', active: true },
                    { label: 'IP Geofencing', active: false },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[13px] text-white/70">{p.label}</span>
                      <div className={cn("w-2 h-2 rounded-full", p.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20")} />
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-brand-light shrink-0" />
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    User will receive a secure onboarding link via email. Access is restricted until MFA is configured.
                  </p>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-[14px] font-bold text-emerald-900">Verified Domain</p>
              <p className="text-[12px] text-emerald-800/60 leading-relaxed font-medium">
                The specified email domain is whitelisted for this organization environment.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
