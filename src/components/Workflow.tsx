import { ClipboardCheck, UserPlus, FileSearch, CheckCircle2, ArrowRight } from 'lucide-react';
import Reveal from './ui/Reveal';

const Workflow = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Seamless Onboarding",
      description: "Sync your entire organization in minutes via HR integrations or bulk CSV. Assign owners automatically.",
      step: "01"
    },
    {
      icon: ClipboardCheck,
      title: "Distributed Assessments",
      description: "Employees complete self-led, intelligent assessments. The system flags real-world risks instantly.",
      step: "02"
    },
    {
      icon: FileSearch,
      title: "Automated Review",
      description: "AI-powered scoring prioritizes high-risk cases for immediate clinical or management review.",
      step: "03"
    },
    {
      icon: CheckCircle2,
      title: "Closed-Loop Resolution",
      description: "Track interventions and verified resolutions. Audit-ready reports generated with one click.",
      step: "04"
    }
  ];

  return (
    <section id="workflow" className="bg-white">
      <div className="section-container">
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <Reveal delay={0.1}>
            <span className="badge-enterprise">Operational Cycle</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-5xl md:text-6xl font-bold text-text-primary mt-6 tracking-tight leading-[1.05] text-balance">
              How SimplyDSE drives <br className="hidden md:block" />
              <span className="text-slate-300">measurable safety.</span>
            </h2>
          </Reveal>
        </div>

        <div className="max-w-4xl mx-auto space-y-24">
          {steps.map((step, i) => (
            <Reveal key={i} delay={0.1} direction="up" width="100%">
              <div className="flex flex-col md:flex-row gap-12 items-start group">
                {/* Visual Step Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-border-subtle shadow-sm flex items-center justify-center relative z-10 group-hover:border-brand-primary/20 transition-colors">
                    <step.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                </div>

                {/* Content Side */}
                <div className="space-y-4">
                  <div className="label-secondary">Phase {step.step}</div>
                  <h3 className="text-3xl font-bold text-text-primary tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed max-w-2xl font-medium">
                    {step.description}
                  </p>
                  <div className="pt-4">
                    <button className="text-[11px] font-bold text-text-muted uppercase tracking-widest hover:text-brand-primary transition-colors flex items-center gap-2 group">
                      Technical Documentation
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
