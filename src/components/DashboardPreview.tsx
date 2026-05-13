'use client';

import Reveal from './ui/Reveal';
import { Activity, Shield } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <section className="bg-slate-50 border-y border-border-subtle">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Content Side */}
          <div className="flex-1 space-y-8">
            <Reveal delay={0.1}>
              <span className="badge-enterprise">Enterprise Control</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.05] text-balance">
                Your entire risk landscape, <br className="hidden md:block" />
                <span className="text-slate-300">in one view.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                A unified command center for health and safety leads. Monitor compliance rates, 
                track intervention progress, and generate board-level reports.
              </p>
            </Reveal>
            
            <div className="grid grid-cols-2 gap-8 pt-4">
              {[
                { icon: Shield, label: "Audit-Ready", sub: "SOC2 Compliant" },
                { icon: Activity, label: "Real-time", sub: "Live data sync" },
              ].map((item, i) => (
                <Reveal key={i} delay={0.4 + i * 0.1}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-border-strong flex items-center justify-center text-brand-primary">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.label}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{item.sub}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Interface Side - High Fidelity CSS Mockup - Minimalist */}
          <div className="flex-1 w-full">
            <Reveal delay={0.4} direction="up">
              <div className="card-enterprise !p-0">
                {/* Dashboard Header */}
                <div className="border-b border-border-subtle p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                    </div>
                    <div className="h-4 w-px bg-border-subtle mx-2" />
                    <div className="label-secondary">Overview</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100" />
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Compliance", val: "94.2%" },
                      { label: "Active Audits", val: "12" },
                      { label: "Risk Alerts", val: "03" },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white border border-border-subtle">
                        <p className="label-secondary mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-text-primary">{stat.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Activity Placeholder */}
                  <div className="bg-slate-50 border border-border-subtle rounded-2xl overflow-hidden p-6 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="label-secondary">Recent Activity</div>
                    </div>
                    {[1, 2].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-slate-200" />
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full" />
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
