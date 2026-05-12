'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  UserPlus, 
  Settings2, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  Shield,
  Globe,
  Mail,
  Users,
  Database,
  Cpu,
  Zap,
  LayoutGrid,
  Lock,
  Search,
  Check,
  AlertCircle,
  Terminal,
  Loader2,
  History
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

import { supabase } from '@/lib/supabase';

type Step = 1 | 2 | 3 | 4 | 5;

const regions = [
  { id: 'us-east-1', name: 'US East (N. Virginia)', icon: '🇺🇸' },
  { id: 'eu-west-1', name: 'EU West (Ireland)', icon: '🇮🇪' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', icon: '🇸🇬' },
];

const modules = [
  { id: 'dse', name: 'DSE Core', desc: 'Standard assessment workflows', icon: LayoutGrid, essential: true },
  { id: 'audit', name: 'Audit Pro', desc: 'Advanced immutable logging', icon: History, essential: false },
  { id: 'analytics', name: 'Enterprise Insights', desc: 'Predictive risk reporting', icon: Zap, essential: false },
  { id: 'sso', name: 'SSO Integration', desc: 'SAML/OIDC connectors', icon: Lock, essential: false },
];

export default function NewOrganizationPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    orgName: '',
    domain: '',
    industry: 'Corporate',
    region: 'eu-west-1',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    plan: 'Enterprise',
    seats: 500,
    selectedModules: ['dse', 'audit'],
  });

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const toggleModule = (id: string) => {
    if (modules.find(m => m.id === id)?.essential) return;
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(id) 
        ? prev.selectedModules.filter(m => m !== id)
        : [...prev.selectedModules, id]
    }));
  };

  const runProvisioning = async () => {
    setIsSubmitting(true);
    setStep(5);
    
    const steps = [
      { log: "Initializing infrastructure configuration...", action: null },
      { log: "Allocating isolated PostgreSQL schema...", action: async () => {
        const { error } = await supabase.from('organizations').insert({
          name: formData.orgName,
          slug: formData.domain.split('.')[0] || formData.orgName.toLowerCase().replace(/\s+/g, '-'),
          status: 'active',
          plan: formData.plan.toLowerCase() as any,
          region: formData.region,
          industry: formData.industry
        });
        if (error) throw error;
      }},
      { log: "Applying database migrations (v1.4.2)...", action: null },
      { log: "Configuring multi-tenant encryption keys...", action: null },
      { log: "Provisioning S3 asset buckets...", action: null },
      { log: "Setting up Edge Middleware routing rules...", action: null },
      { log: "Registering administrator identity...", action: async () => {
        // Log the event in audit logs
        await supabase.from('audit_logs').insert({
          action: 'ORGANIZATION_PROVISION',
          entity_type: 'organization',
          details: { 
            name: formData.orgName, 
            admin: formData.adminEmail,
            region: formData.region,
            plan: formData.plan 
          }
        });
      }},
      { log: "Generating platform access tokens...", action: null },
      { log: "Sending welcome invitation to administrator...", action: null },
      { log: "Tenant environment online.", action: null }
    ];

    try {
      for (const step of steps) {
        setProvisioningLogs(prev => [...prev, step.log]);
        if (step.action) await step.action();
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      }
    } catch (error: any) {
      console.error('Provisioning failed:', error);
      setProvisioningLogs(prev => [...prev, `ERROR: ${error.message || 'Provisioning failed'}. Rollback initiated.`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/admin/organizations" 
              className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-brand-primary transition-all uppercase tracking-[0.2em] group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Back to Fleet
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Provision New Tenant</h1>
              <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">Configure and deploy an isolated organization environment.</p>
            </div>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center gap-3 md:gap-4 bg-white border border-slate-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-sm overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-bold transition-all",
                    step === s ? "bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/20" : 
                    step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span className={cn(
                    "text-[10px] md:text-[11px] font-bold uppercase tracking-widest hidden sm:block",
                    step === s ? "text-slate-900" : "text-slate-400"
                  )}>
                    {s === 1 ? 'Org' : s === 2 ? 'Infra' : s === 3 ? 'Licensing' : 'Admin'}
                  </span>
                </div>
                {s < 4 && <div className="w-3 md:w-4 h-[1px] bg-slate-200 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[600px]">
              <div className="flex-1 p-10">
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Organization Legal Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Acme Corp Industries"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                          value={formData.orgName}
                          onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Preferred Subdomain</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="acmecorp"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-32 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                              value={formData.domain}
                              onChange={(e) => setFormData({...formData, domain: e.target.value})}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">
                              .simplydse.com
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Primary Industry</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none appearance-none cursor-pointer"
                            value={formData.industry}
                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          >
                            <option>Corporate</option>
                            <option>Government</option>
                            <option>Manufacturing</option>
                            <option>Education</option>
                            <option>Healthcare</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Deployment Region</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {regions.map((region) => (
                            <button
                              key={region.id}
                              onClick={() => setFormData({...formData, region: region.id})}
                              className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all text-center",
                                formData.region === region.id 
                                  ? "bg-brand-primary/5 border-brand-primary shadow-lg shadow-brand-primary/5" 
                                  : "bg-white border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <span className="text-2xl">{region.icon}</span>
                              <span className="text-[12px] font-bold text-slate-900">{region.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Platform Modules</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {modules.map((mod) => (
                            <button
                              key={mod.id}
                              onClick={() => toggleModule(mod.id)}
                              className={cn(
                                "flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group",
                                formData.selectedModules.includes(mod.id) 
                                  ? "bg-white border-brand-primary shadow-lg shadow-brand-primary/5" 
                                  : "bg-slate-50/50 border-slate-200 hover:border-slate-300 opacity-60"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                formData.selectedModules.includes(mod.id) ? "bg-brand-primary text-white" : "bg-white text-slate-400 group-hover:text-slate-600"
                              )}>
                                <mod.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 pr-2">
                                <p className="text-[13px] font-bold text-slate-900">{mod.name}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{mod.desc}</p>
                              </div>
                              {formData.selectedModules.includes(mod.id) && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Starter', 'Professional', 'Enterprise'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setFormData({...formData, plan: p})}
                            className={cn(
                              "p-8 rounded-[2rem] border text-left transition-all relative overflow-hidden group",
                              formData.plan === p 
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.05] z-10" 
                                : "bg-white text-slate-900 border-slate-200 hover:border-brand-primary"
                            )}
                          >
                            {p === 'Enterprise' && (
                              <div className="absolute top-4 right-4 px-2 py-1 bg-brand-primary text-white text-[8px] font-bold rounded uppercase tracking-widest">Recommended</div>
                            )}
                            <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-4", formData.plan === p ? "text-slate-400" : "text-slate-500")}>Plan Type</p>
                            <p className="text-xl font-bold mb-2">{p}</p>
                            <div className="space-y-3 mt-6">
                              {[1,2,3].map(i => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle2 className={cn("w-3.5 h-3.5", formData.plan === p ? "text-brand-primary" : "text-emerald-500")} />
                                  <span className={cn("text-[11px] font-medium", formData.plan === p ? "text-slate-300" : "text-slate-600")}>Premium Feature {i}</span>
                                </div>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Employee License Seats</label>
                          <span className="text-xl font-bold text-brand-primary">{formData.seats.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="50000" 
                          step="100"
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                          value={formData.seats}
                          onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value)})}
                        />
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                          <span>100 seats</span>
                          <span>25,000 seats</span>
                          <span>50,000 seats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Admin First Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. John"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                            value={formData.adminFirstName}
                            onChange={(e) => setFormData({...formData, adminFirstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Admin Last Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Smith"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                            value={formData.adminLastName}
                            onChange={(e) => setFormData({...formData, adminLastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Admin Email Address</label>
                        <input 
                          type="email" 
                          placeholder="j.smith@acmecorp.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                        />
                      </div>
                      
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <p className="text-[13px] font-bold text-amber-900 mb-1">Onboarding Activation</p>
                          <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                            An automated invitation will be sent to this email once the environment is online. The admin will be prompted to set their secure password upon first login.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="h-full space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                          <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">Provisioning Environment</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Deploying {formData.orgName} infrastructure...</p>
                        </div>
                      </div>
                      {!isSubmitting && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5" />
                          Complete
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 rounded-[1.5rem] p-6 font-mono text-[12px] space-y-2 min-h-[300px] overflow-y-auto">
                      {provisioningLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                          <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                          <span className={cn(
                            i === provisioningLogs.length - 1 && isSubmitting ? "text-brand-primary" : "text-slate-300"
                          )}>
                            {i === provisioningLogs.length - 1 && isSubmitting && <Loader2 className="w-3 h-3 inline mr-2 animate-spin" />}
                            {log}
                          </span>
                        </div>
                      ))}
                      {isSubmitting && <div className="w-2 h-4 bg-brand-primary animate-pulse inline-block ml-1" />}
                    </div>

                    {!isSubmitting && (
                      <div className="flex flex-col items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-sm ring-4 ring-emerald-50/50">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Platform Ready</h2>
                        <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed text-center">
                          Environment for <span className="font-bold text-slate-900">{formData.orgName}</span> is now live at <span className="text-brand-primary font-bold">{formData.domain}.simplydse.com</span>
                        </p>
                        
                        <div className="mt-10 flex gap-4 w-full max-w-sm">
                          <Link href="/admin/organizations" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white text-[12px] font-bold rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-slate-900/10">
                            Go to Fleet
                          </Link>
                          <button 
                            onClick={() => {
                              setStep(1);
                              setProvisioningLogs([]);
                              setFormData({...formData, orgName: '', domain: '', adminFirstName: '', adminLastName: '', adminEmail: ''});
                            }} 
                            className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-900 text-[12px] font-bold rounded-2xl hover:bg-slate-50 transition-all"
                          >
                            New Provision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Footer */}
              {step < 5 && (
                <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    onClick={prevStep}
                    disabled={step === 1}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest disabled:opacity-0"
                  >
                    Previous Step
                  </button>

                  {step < 4 ? (
                    <button 
                      onClick={nextStep}
                      disabled={step === 1 && (!formData.orgName || !formData.domain)}
                      className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white text-[12px] font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={runProvisioning}
                      className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white text-[12px] font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all active:scale-95 group"
                    >
                      Deploy Infrastructure
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Context / Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6">Provisioning Summary</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-1">{formData.orgName || 'Not specified'}</p>
                    {formData.domain && <p className="text-[11px] text-brand-primary font-bold mt-1">{formData.domain}.simplydse.com</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infrastructure</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-1">{regions.find(r => r.id === formData.region)?.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">{formData.selectedModules.length} Active Modules</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Licensing</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-1">{formData.plan} Plan</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">{formData.seats.toLocaleString()} Seats Allocated</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-1">
                      {formData.adminFirstName || formData.adminLastName ? `${formData.adminFirstName} ${formData.adminLastName}` : 'Not assigned'}
                    </p>
                    {formData.adminEmail && <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[180px]">{formData.adminEmail}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-brand-primary/5 border border-brand-primary/10 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-3 text-brand-primary mb-4">
                <Shield className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Compliance Guard</span>
              </div>
              <p className="text-[12px] text-brand-primary/80 leading-relaxed font-medium relative z-10">
                Tenant provisioning triggers automated compliance verification for the selected region's data sovereignty laws (GDPR/SOC2).
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
