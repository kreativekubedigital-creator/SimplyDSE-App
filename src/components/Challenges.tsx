'use client';

import Reveal from './ui/Reveal';
import { AlertCircle, Clock, FileWarning, TrendingDown } from 'lucide-react';

interface ChallengesProps {
  data?: {
    badge?: string;
    headline?: string;
    description?: string;
    items?: {
      title: string;
      description: string;
    }[];
  };
}

const Challenges = ({ data }: ChallengesProps) => {
  const defaultChallenges = [
    {
      title: "Compliance Drift",
      description: "Regulatory frameworks evolve faster than your manual spreadsheets. Maintaining audit-ready status becomes a full-time liability.",
      icon: FileWarning
    },
    {
      title: "Hidden Risk",
      description: "Without real-time monitoring, 80% of workstation health risks go unnoticed until they become expensive clinical claims.",
      icon: TrendingDown
    },
    {
      title: "Operational Drag",
      description: "Manual assessments consume hundreds of HR hours every quarter. That's time lost on strategic talent initiatives.",
      icon: Clock
    }
  ];

  const challenges = data?.items?.map((item, index) => ({
    ...item,
    icon: [FileWarning, TrendingDown, Clock][index % 3] // Cycle through icons
  })) || defaultChallenges;

  return (
    <section id="challenges" className="bg-white">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Headline Side */}
          <div className="lg:w-1/3">
            <Reveal delay={0.1}>
              <span className="badge-enterprise">{data?.badge || "The Reality"}</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mt-6 tracking-tight text-balance leading-[1.1]" 
                  dangerouslySetInnerHTML={{ __html: data?.headline || "The cost of <span className=\"text-danger\">manual</span> compliance." }} 
              />
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-text-secondary text-lg mt-8 leading-relaxed">
                {data?.description || "Disconnected systems and manual workflows aren't just slow—they're dangerous to your Organisation's bottom line."}
              </p>
            </Reveal>
          </div>

          {/* List Side */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {challenges.map((item, i) => (
              <Reveal key={i} delay={0.4 + i * 0.1}>
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-border-subtle flex items-center justify-center text-text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
            
            {/* CTA in the grid */}
            <Reveal delay={0.7}>
              <div className="h-full flex items-center">
                <div className="p-8 rounded-3xl bg-danger/5 border border-danger/10 w-full">
                  <div className="flex items-center gap-3 text-danger mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Industry Insight</span>
                  </div>
                  <p className="text-text-primary font-bold text-lg leading-snug">
                    Manual DSE processes increase Organisational liability by up to 40% annually.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Challenges;
