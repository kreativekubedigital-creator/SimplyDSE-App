'use client';

import Reveal from './ui/Reveal';
import { ArrowRight, Globe, BarChart2, Briefcase } from 'lucide-react';
import Image from 'next/image';

const Solutions = () => {
  const solutions = [
    {
      badge: "Empowering Teams",
      title: "Built for the modern, distributed workforce.",
      description: "Whether your team is in a central HQ or spread across continents, SimplyDSE provides a unified platform for risk management. Our collaboration tools allow global teams to stay synchronized on compliance standards and action plans.",
      image: "/solution-1.png",
      icon: Globe,
      reverse: false
    },
    {
      badge: "Operational Efficiency",
      title: "Automation that respects your team's time.",
      description: "Eliminate the administrative burden of manual follow-ups. SimplyDSE automates assessment distribution, tracking, and reporting, allowing your health and safety leads to focus on strategic initiatives.",
      image: "/solution-3.png",
      icon: Briefcase,
      reverse: false
    }
  ];

  return (
    <section id="solutions" className="bg-white pb-32 md:pb-48 pt-16 md:pt-24">
      <div className="section-container space-y-32 md:space-y-56">
        {solutions.map((item, index) => (
          <div key={index} className={`flex flex-col ${item.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
            {/* Content Side */}
            <div className={`flex-1 w-full space-y-8 ${item.reverse ? 'md:pl-12' : 'md:pr-12'}`}>
              <Reveal delay={0.2} width="100%">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-border-strong text-text-secondary text-[11px] font-bold tracking-widest uppercase">
                  <item.icon className="w-3.5 h-3.5 text-brand-primary" />
                  {item.badge}
                </div>
              </Reveal>
              
              <Reveal delay={0.3} width="100%">
                <h2 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1] text-balance">
                  {item.title}
                </h2>
              </Reveal>

              <Reveal delay={0.4} width="100%">
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl opacity-70">
                  {item.description}
                </p>
              </Reveal>

              <Reveal delay={0.5} width="100%">
                <button className="flex items-center gap-2 text-brand-primary font-bold hover:gap-3 transition-all group pt-2">
                  Explore Enterprise Solution
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Reveal>
            </div>

            {/* Visual Side */}
            <div className="flex-1 w-full">
              <Reveal delay={0.4} direction={item.reverse ? "left" : "right"} width="100%">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-border-subtle aspect-[4/3] bg-slate-50 group">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </Reveal>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Solutions;

