'use client';

import Reveal from './ui/Reveal';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "SimplyDSE has completely transformed how we handle health and safety across our 12 global offices. The clinical oversight is world-class.",
      author: "Sarah Jenkins",
      role: "Global Health & Safety Director, HSBC",
      avatar: "SJ"
    },
    {
      quote: "The level of detail in the audit reports and the ease of onboarding is unmatched. It's the most sophisticated DSE platform I've seen.",
      author: "David Chen",
      role: "Operations Lead, Siemens Europe",
      avatar: "DC"
    }
  ];

  return (
    <section id="testimonials" className="bg-white">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-1/3 space-y-6">
            <Reveal delay={0.1}>
              <span className="badge-enterprise">Social Proof</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-[1.1]">
                Endorsed by <span className="text-brand-primary">industry leaders.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-text-secondary text-lg leading-relaxed">
                We empower health and safety professionals in the world's most demanding organizations to deliver excellence.
              </p>
            </Reveal>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((item, i) => (
              <Reveal key={i} delay={0.4 + i * 0.1} direction="up" hFull>
                <div className="card-enterprise h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <Quote className="w-8 h-8 text-brand-primary/20" />
                    <p className="text-xl font-medium text-text-primary leading-relaxed italic">
                      "{item.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border-subtle">
                    <div className="w-10 h-10 rounded-full bg-bg-muted flex items-center justify-center text-xs font-bold text-text-muted border border-border-strong">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary tracking-tight">{item.author}</p>
                      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{item.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
