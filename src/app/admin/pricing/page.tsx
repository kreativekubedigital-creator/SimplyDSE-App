'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Pencil, Trash2, X, CheckCircle2, GripVertical,
  Star, Save, AlertTriangle, Loader2, Zap, Crown, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_seats: number | null;
  features: string[];
  is_active: boolean;
  is_recommended: boolean;
  sort_order: number;
}

const emptyPlan: Omit<Plan, 'id'> = {
  name: '',
  slug: '',
  description: '',
  price_monthly: 0,
  price_yearly: 0,
  currency: 'GBP',
  max_seats: null,
  features: [],
  is_active: true,
  is_recommended: false,
  sort_order: 0,
};

const currencySymbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };

export default function PricingManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

  // Edit form
  const [form, setForm] = useState(emptyPlan);
  const [featureInput, setFeatureInput] = useState('');

  async function fetchPlans() {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setPlans(data);
    setLoading(false);
  }

  useEffect(() => { fetchPlans(); }, []);

  function openNew() {
    setForm({ ...emptyPlan, sort_order: plans.length + 1 });
    setIsNew(true);
    setEditPlan({} as Plan);
  }

  function openEdit(plan: Plan) {
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      currency: plan.currency,
      max_seats: plan.max_seats,
      features: plan.features || [],
      is_active: plan.is_active,
      is_recommended: plan.is_recommended,
      sort_order: plan.sort_order,
    });
    setIsNew(false);
    setEditPlan(plan);
  }

  function addFeature() {
    if (!featureInput.trim()) return;
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }));
    setFeatureInput('');
  }

  function removeFeature(idx: number) {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.name || !form.slug) return;
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      price_monthly: form.price_monthly,
      price_yearly: form.price_yearly,
      currency: form.currency,
      max_seats: form.max_seats,
      features: form.features,
      is_active: form.is_active,
      is_recommended: form.is_recommended,
      sort_order: form.sort_order,
    };

    if (isNew) {
      const { error } = await supabase.from('plans').insert(payload);
      if (error) { alert('Error: ' + error.message); setSaving(false); return; }
    } else if (editPlan?.id) {
      const { error } = await supabase.from('plans').update(payload).eq('id', editPlan.id);
      if (error) { alert('Error: ' + error.message); setSaving(false); return; }
    }

    setEditPlan(null);
    setSaving(false);
    fetchPlans();
  }

  async function handleDelete() {
    if (!deletePlan) return;
    setSaving(true);
    await supabase.from('plans').delete().eq('id', deletePlan.id);
    setDeletePlan(null);
    setSaving(false);
    fetchPlans();
  }

  const sym = (c: string) => currencySymbols[c] || c;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Price Management</h1>
          <p className="text-[13px] text-slate-500 mt-1">Create and manage subscription plans for organisation onboarding.</p>
        </div>
        <button onClick={openNew} className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={cn(
            "relative bg-white border rounded-3xl overflow-hidden transition-all hover:shadow-lg group",
            plan.is_recommended ? "border-brand-primary shadow-lg shadow-brand-primary/10" : "border-slate-200",
            !plan.is_active && "opacity-60"
          )}>
            {plan.is_recommended && (
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-brand-primary text-white text-[8px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3 h-3" /> Recommended
              </div>
            )}
            {!plan.is_active && (
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-slate-200 text-slate-600 text-[8px] font-bold rounded-full uppercase tracking-widest">
                Inactive
              </div>
            )}

            <div className="p-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Plan</p>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{sym(plan.currency)}{plan.price_monthly}</span>
                <span className="text-sm text-slate-400 font-medium">/month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                or {sym(plan.currency)}{plan.price_yearly}/year
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {plan.max_seats ? `Up to ${plan.max_seats.toLocaleString()} seats` : 'Unlimited seats'}
                </p>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-brand-primary font-bold">+{plan.features.length - 4} more features</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button onClick={() => openEdit(plan)} className="flex-1 py-2.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setDeletePlan(plan)} className="py-2.5 px-4 text-[11px] font-bold text-rose-600 bg-white border border-rose-100 rounded-xl hover:bg-rose-50 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-20">
            <Tag className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No plans created yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first plan to get started.</p>
          </div>
        )}
      </div>

      {/* EDIT / CREATE MODAL */}
      {editPlan && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setEditPlan(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-slate-900">{isNew ? 'Create New Plan' : 'Edit Plan'}</h2>
                <button onClick={() => setEditPlan(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Name</label>
                    <input type="text" value={form.name} onChange={e => {
                      const name = e.target.value;
                      setForm(f => ({ ...f, name, slug: isNew ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : f.slug }));
                    }} placeholder="e.g. Enterprise" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slug</label>
                    <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="enterprise" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this plan" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Price</label>
                    <input type="number" step="0.01" min="0" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yearly Price</label>
                    <input type="number" step="0.01" min="0" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency</label>
                    <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Seats (leave empty for unlimited)</label>
                  <input type="number" min="1" value={form.max_seats ?? ''} onChange={e => setForm(f => ({ ...f, max_seats: e.target.value ? parseInt(e.target.value) : null }))} placeholder="Unlimited" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Features</label>
                  <div className="flex gap-2">
                    <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Type a feature and press Enter" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                    <button type="button" onClick={addFeature} className="px-4 py-2.5 bg-brand-primary/5 text-brand-primary text-xs font-bold rounded-xl border border-brand-primary/10 hover:bg-brand-primary/10 transition-all">Add</button>
                  </div>
                  {form.features.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {form.features.map((f, i) => (
                        <li key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                          <span className="text-xs text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f}
                          </span>
                          <button onClick={() => removeFeature(i)} className="p-1 text-slate-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={cn("w-10 h-5 rounded-full transition-all relative", form.is_active ? "bg-emerald-500" : "bg-slate-200")}>
                      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", form.is_active ? "left-5.5" : "left-0.5")} />
                    </button>
                    <span className="text-xs font-bold text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => setForm(f => ({ ...f, is_recommended: !f.is_recommended }))} className={cn("w-10 h-5 rounded-full transition-all relative", form.is_recommended ? "bg-brand-primary" : "bg-slate-200")}>
                      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", form.is_recommended ? "left-5.5" : "left-0.5")} />
                    </button>
                    <span className="text-xs font-bold text-slate-700">Recommended</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
                <button onClick={() => setEditPlan(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.slug} className="flex-1 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isNew ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {deletePlan && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setDeletePlan(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Delete Plan</h2>
                <p className="text-sm text-slate-500">Permanently delete <strong>{deletePlan.name}</strong>? Existing organisations on this plan won't be affected.</p>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button onClick={() => setDeletePlan(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 py-3 bg-rose-600 text-white text-[12px] font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
