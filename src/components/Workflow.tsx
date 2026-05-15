'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle } from 'lucide-react';
import Reveal from './ui/Reveal';

const StepVisual = ({ type }: { type: string }) => {
  if (type === 'grid') {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0F172A]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px', transform: 'perspective(500px) rotateX(60deg) translateY(-50px)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl flex items-center px-3 gap-2"
          >
            <div className="w-5 h-5 rounded bg-brand-primary/20" />
            <div className="h-2 w-16 bg-white/20 rounded-full" />
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (type === 'radiant') {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0F172A] flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" 
            style={{ transform: `rotate(${i * 45}deg)` }} 
          />
        ))}
        <div className="w-10 h-10 bg-white rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          <Zap className="w-5 h-5 text-brand-primary -rotate-45" />
        </div>
      </div>
    );
  }

  if (type === 'nodes') {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0F172A] p-6 flex flex-col justify-center gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="flex-1 h-8 rounded bg-white/5 border border-white/10 relative overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0F172A] flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};

const Workflow = () => {
  const steps = [
    {
      step: "01",
      title: "Set Up Your Organisation",
      description: "Create your company profile and upload your staff securely. Assign roles and get your team ready in minutes.",
      visual: "grid"
    },
    {
      step: "02",
      title: "Send & Complete Assessments",
      description: "Invite employees to complete DSE assessments via email, ensuring a guided, consistent experience that is simple and easy to follow.",
      visual: "radiant"
    },
    {
      step: "03",
      title: "Track Results & Take Action",
      description: "Monitor completion rates, identify risk levels, and generate reports instantly to take action and improve workplace safety and compliance.",
      visual: "nodes"
    },
    {
      step: "04",
      title: "Improve & Stay Compliant",
      description: "Use assessment data and reports to implement improvements, reduce risks, support employee wellbeing, and maintain ongoing DSE compliance standards.",
      visual: "check"
    }
  ];

  return (
    <section id="workflow" className="bg-white">
      <div className="section-container">
        <div className="mb-12">
          <Reveal delay={0.1}>
            <div className="text-brand-primary text-xs font-black uppercase tracking-[0.3em] mb-4">Operations</div>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-tight mb-8">
              How It Works
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="max-w-2xl">
              <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
                Built for Simplicity. Designed for Compliance.
              </h3>
              <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium">
                Our mission is to remove the complexity from DSE assessments by providing a centralised platform that is easy to use, scalable, and built for real-world organisational needs.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.1} direction="up" width="100%" hFull>
              <div className="group bg-[#111827] border border-[#1F2937] rounded-3xl p-8 h-full flex flex-col transition-all hover:border-brand-primary/30 shadow-xl">
                <div className="h-40 mb-8 shrink-0">
                  <StepVisual type={step.visual} />
                </div>
                
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Step {step.step}</div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-white/90 leading-relaxed">
                    {step.description}
                  </p>
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
