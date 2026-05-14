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
import { provisionTenant } from '@/app/actions/provision-tenant';

type Step = 1 | 2 | 3 | 4 | 5;

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_seats: number | null;
  features: string[];
  is_recommended: boolean;
}

const currencySymbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };

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

export default function NewOrganisationPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [formData, setFormData] = useState({
    orgName: '',
    domain: '',
    industry: 'Corporate',
    region: 'eu-west-1',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'enterprise',
    seats: 100,
    selectedModules: ['dse', 'audit'],
    logoUrl: '',
  });

  // Fetch plans from DB
  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) {
        setAvailablePlans(data);
        // Default to recommended or first plan
        const recommended = data.find((p: any) => p.is_recommended);
        if (recommended) setFormData(prev => ({ ...prev, plan: recommended.slug }));
      }
    }
    loadPlans();
  }, []);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runProvisioning = async () => {
    setIsSubmitting(true);
    setStep(5);
    setProvisioningLogs(["Preparing workspace configuration..."]);
    
    // Slight artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setProvisioningLogs(prev => [...prev, "Setting up secure database...", "Preparing organisation environment..."]);

    const result = await provisionTenant(formData);

    if (result.success) {
      setProvisioningLogs(prev => [
        ...prev, 
        "Applying system updates...",
        "Registering administrator identity...",
        "Generating secure access tokens...",
        "Sending welcome invitation to administrator...",
        "Organisation workspace is now online."
      ]);
    } else {
      setProvisioningLogs(prev => [...prev, `ERROR: ${result.error}. Rollback initiated.`]);
    }
    
    setIsSubmitting(false);
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Set Up New Organisation</h1>
              <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">Configure and deploy a new secure workspace for a client.</p>
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
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Organisation Legal Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Acme Corp Industries"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                          value={formData.orgName}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                              .replace(/\s+/g, '-')        // Replace spaces with -
                              .replace(/-+/g, '-');        // Remove duplicate -
                            
                            setFormData(prev => ({
                              ...prev, 
                              orgName: name,
                              // Only auto-fill domain if it's currently empty or matches the slug of the previous name
                              domain: (!prev.domain || prev.domain === prev.orgName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')) 
                                ? slug 
                                : prev.domain
                            }));
                          }}
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
                              onChange={(e) => {
                                const val = e.target.value.toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '') // Only allow alphanumeric and hyphens
                                  .replace(/-+/g, '-');       // Remove duplicate -
                                setFormData({...formData, domain: val});
                              }}
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
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Organisation Logo</label>
                        <div className="flex items-center gap-4">
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo Preview" className="w-16 h-16 rounded-xl border border-slate-200 object-contain bg-white" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[12px] file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 transition-all cursor-pointer"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">Recommended: Square PNG or JPG, max 1MB</p>
                          </div>
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
                      {availablePlans.length > 0 ? (
                        <div className={cn("grid gap-4", availablePlans.length <= 3 ? `grid-cols-1 md:grid-cols-${availablePlans.length}` : 'grid-cols-1 md:grid-cols-3')}>
                          {availablePlans.map((p) => {
                            const isSelected = formData.plan === p.slug;
                            const sym = currencySymbols[p.currency] || p.currency;
                            return (
                              <button
                                key={p.id}
                                onClick={() => setFormData({...formData, plan: p.slug})}
                                className={cn(
                                  "p-8 rounded-[2rem] border text-left transition-all relative overflow-hidden group",
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.03] z-10" 
                                    : "bg-white text-slate-900 border-slate-200 hover:border-brand-primary"
                                )}
                              >
                                {p.is_recommended && (
                                  <div className="absolute top-4 right-4 px-2 py-1 bg-brand-primary text-white text-[8px] font-bold rounded uppercase tracking-widest">Recommended</div>
                                )}
                                <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-2", isSelected ? "text-slate-400" : "text-slate-500")}>Plan Type</p>
                                <p className="text-xl font-bold mb-1">{p.name}</p>
                                <div className="flex items-baseline gap-1 mt-3">
                                  <span className="text-2xl font-bold">{sym}{p.price_monthly}</span>
                                  <span className={cn("text-xs font-medium", isSelected ? "text-slate-400" : "text-slate-500")}>/mo</span>
                                </div>
                                <p className={cn("text-[11px] mt-1", isSelected ? "text-slate-400" : "text-slate-500")}>
                                  {p.max_seats ? `Up to ${p.max_seats.toLocaleString()} seats` : 'Unlimited seats'}
                                </p>
                                <div className="space-y-2 mt-5">
                                  {p.features.slice(0, 4).map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <CheckCircle2 className={cn("w-3.5 h-3.5", isSelected ? "text-brand-primary" : "text-emerald-500")} />
                                      <span className={cn("text-[11px] font-medium", isSelected ? "text-slate-300" : "text-slate-600")}>{feat}</span>
                                    </div>
                                  ))}
                                  {p.features.length > 4 && (
                                    <p className={cn("text-[10px] font-bold", isSelected ? "text-brand-primary" : "text-slate-400")}>+{p.features.length - 4} more</p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <p className="text-sm font-bold">No plans configured</p>
                          <p className="text-xs mt-1">Go to Price Management to create plans first.</p>
                        </div>
                      )}

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Employee License Seats</label>
                        <input 
                          type="number" 
                          min="1"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                          value={formData.seats}
                          onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value) || 1})}
                          placeholder="Enter number of seats"
                        />
                        <p className="text-[11px] text-slate-400 pl-1">Type any number. This defines how many employees can be onboarded.</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Temporary Password</label>
                          <input 
                            type="text" 
                            placeholder="Set a temp password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                        <div>
                          <p className="text-[13px] font-bold text-amber-900 mb-1">Onboarding Activation</p>
                          <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                            The admin can log in immediately using this password at the organization subdomain. No email verification wait required.
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
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">Setting up Workspace</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Preparing {formData.orgName} environment...</p>
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
                          Workspace for <span className="font-bold text-slate-900">{formData.orgName}</span> is now live at <span className="text-brand-primary font-bold">{formData.domain}.simplydse.com</span>
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
                            Set Up Another
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
                      Complete Setup
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
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organisation</p>
                    <p className="text-[13px] font-bold text-slate-900 mt-1">{formData.orgName || 'Not specified'}</p>
                    {formData.domain && <p className="text-[11px] text-brand-primary font-bold mt-1">{formData.domain}.simplydse.com</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>
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
                    <p className="text-[13px] font-bold text-slate-900 mt-1">{availablePlans.find(p => p.slug === formData.plan)?.name || formData.plan} Plan</p>
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
                Workspace setup triggers automated compliance verification for the selected region's data sovereignty laws (GDPR/SOC2).
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
