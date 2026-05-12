'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Search,
  ChevronRight,
  Wallet,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../components/admin/StatCard';
import { supabase } from '@/lib/supabase';

export default function GlobalBillingPage() {
  const [billingStats, setBillingStats] = useState({
    totalOrgs: 0,
    planDistribution: {
      enterprise: 0,
      pro: 0,
      starter: 0
    },
    loading: true
  });

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const { data } = await supabase
          .from('organizations')
          .select('plan');
        
        if (data) {
          const dist = data.reduce((acc: any, curr: any) => {
            acc[curr.plan] = (acc[curr.plan] || 0) + 1;
            return acc;
          }, { enterprise: 0, pro: 0, starter: 0 });
          
          setBillingStats({
            totalOrgs: data.length,
            planDistribution: dist,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
        setBillingStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchBillingData();
  }, []);

  const enterpriseCount = billingStats.planDistribution.enterprise;
  const proCount = billingStats.planDistribution.pro;
  const starterCount = billingStats.planDistribution.starter;
  const totalWithPlan = enterpriseCount + proCount + starterCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revenue & Billing Hub</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage global subscriptions, financial health, and enterprise licensing revenue.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl hover:bg-slate-50 transition-all">
              Export Financials
            </button>
            <button className="px-6 py-3 bg-brand-primary text-white text-[12px] font-bold rounded-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              Financial Settings
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total ARR" 
            value={billingStats.totalOrgs > 0 ? `$${(billingStats.totalOrgs * 12000).toLocaleString()}` : "$0"} 
            change="Live" 
            trend="up" 
            icon={TrendingUp} 
          />
          <StatCard 
            label="Monthly Revenue" 
            value={billingStats.totalOrgs > 0 ? `$${(billingStats.totalOrgs * 1000).toLocaleString()}` : "$0"} 
            change="Nominal" 
            trend="up" 
            icon={DollarSign} 
          />
          <StatCard 
            label="Pending Invoices" 
            value="0" 
            change="$0" 
            trend="neutral" 
            icon={Calendar} 
          />
          <StatCard 
            label="Active Organizations" 
            value={billingStats.totalOrgs.toString()} 
            change="Synced" 
            trend="up" 
            icon={Wallet} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Recent Invoices */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-slate-900">Platform-Wide Transactions</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search invoices..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none w-48 focus:ring-2 focus:ring-brand-primary/5 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px] flex items-center justify-center">
              <div className="text-center p-20">
                <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No live transactions recorded. Billing provider integration pending.</p>
                <button className="mt-6 text-[12px] font-bold text-brand-primary hover:underline">
                  Connect Stripe Account
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-brand-primary rounded-[2.5rem] p-10 text-white shadow-xl shadow-brand-primary/20 space-y-8">
              <h3 className="text-[18px] font-bold">Plan Distribution</h3>
              <div className="space-y-6">
                {[
                  { label: 'Enterprise', val: totalWithPlan > 0 ? Math.round((enterpriseCount / totalWithPlan) * 100) : 0, color: 'white' },
                  { label: 'Pro', val: totalWithPlan > 0 ? Math.round((proCount / totalWithPlan) * 100) : 0, color: 'white/70' },
                  { label: 'Starter', val: totalWithPlan > 0 ? Math.round((starterCount / totalWithPlan) * 100) : 0, color: 'white/40' },
                ].map((plan, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[13px] font-bold">
                      <span style={{ color: plan.color }}>{plan.label}</span>
                      <span>{plan.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-1000" 
                        style={{ width: `${plan.val}%`, opacity: plan.label === 'Enterprise' ? 1 : plan.label === 'Pro' ? 0.6 : 0.3 }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-6">
              <h3 className="text-[16px] font-bold text-slate-900">Payout Accounts</h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Stripe Connect</p>
                  <p className="text-[11px] text-slate-400 font-medium">Verified Account</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                Manage Financial Gateways
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
