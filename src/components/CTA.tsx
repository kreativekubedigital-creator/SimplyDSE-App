'use client';

import Reveal from './ui/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CTA = () => {
  return (
    <section id="contact" className="bg-white py-32 md:py-48">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Reveal delay={0.1}>
            <span className="badge-enterprise">Get Started</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-6xl md:text-8xl font-bold text-text-primary tracking-tighter leading-[0.9] text-balance">
              Secure your workforce. <br />
              <span className="text-slate-300">Automate compliance.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              Join the world's most sophisticated organizations in redefining workplace health and safety.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <Link href="/contact" className="btn-enterprise-primary text-lg px-10 py-5">
                Get Started Today
              </Link>
              <Link href="/contact" className="text-text-primary font-bold hover:text-brand-primary transition-colors flex items-center gap-2 group">
                Contact Sales
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default CTA;
