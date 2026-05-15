'use client';

import { motion } from 'framer-motion';
import { Shield, Target, Users, Zap, CheckCircle2, ArrowRight, Heart, Activity } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <ClientLayoutWrapper>
        <main className="relative pt-32">
          
          {/* Hero Section */}
          <section className="relative px-6 pb-24 overflow-hidden">
            <div className="max-w-[1200px] mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-brand-primary">Our Purpose</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 text-text-primary leading-[1.05]">
                  About <span className="text-brand-primary italic">SimplyDSE</span>
                </h1>
                
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 tracking-tight max-w-4xl mx-auto leading-tight">
                  Make Workplace Ergonomics <span className="text-text-muted">Simple, Scalable, and Effective</span>
                </h2>
                
                <p className="text-xl text-text-secondary leading-relaxed mb-12 max-w-3xl mx-auto">
                  SimplyDSE was built to remove the complexity from DSE assessments and workplace ergonomics management. We give organisations a structured way to identify workstation risks, support employees, and maintain consistent compliance across office and remote environments.
                </p>
              </motion.div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square -z-10">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px]" />
            </div>
          </section>

          {/* Streamlined System Section */}
          <section className="py-24 px-6 bg-slate-50 border-y border-border-subtle">
            <div className="max-w-[1200px] mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div className="glass-card p-10 space-y-6 border-l-4 border-l-brand-primary">
                    <p className="text-lg text-text-primary leading-relaxed font-medium">
                      Instead of relying on fragmented processes or manual tracking, SimplyDSE brings everything into one streamlined system.
                    </p>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      This helps organisations take control of risk at scale while ensuring every employee receives the same standard of care, wherever they work.
                    </p>
                    <div className="pt-4 flex items-center gap-3 text-brand-primary font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Zero administrative burden</span>
                    </div>
                  </div>
                  <p className="text-xl text-text-secondary font-medium italic pl-4">
                    "The result is a clearer, faster, and more reliable way to manage workplace ergonomics without creating extra administrative burden."
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="relative glass-card overflow-hidden aspect-[4/3] shadow-2xl">
                    <img 
                      src="/Man ergonomic 2.png" 
                      alt="Man working ergonomically" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Beyond Compliance Section */}
          <section className="py-32 px-6">
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                    Go Beyond Compliance and <br/><span className="text-brand-primary">Improve Everyday Working Conditions</span>
                  </h2>
                  <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
                    Meeting DSE requirements is only the starting point. The real value comes from improving how people feel and perform at work every day.
                  </p>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Target className="w-6 h-6 text-brand-primary" />,
                    title: "Early Identification",
                    text: "SimplyDSE helps organisations identify issues early, reducing discomfort linked to poor workstation setup."
                  },
                  {
                    icon: <Activity className="w-6 h-6 text-brand-primary" />,
                    title: "Healthier Habits",
                    text: "Create healthier working habits across the workforce, supporting reduced fatigue and fewer preventable issues."
                  },
                  {
                    icon: <Heart className="w-6 h-6 text-brand-primary" />,
                    title: "Stronger Engagement",
                    text: "When employees work in better conditions, organisations see stronger engagement and fewer disruptions."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[32px] bg-slate-50 border border-border-subtle hover:border-brand-primary/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Performance Priority Section */}
          <section className="py-32 px-6 bg-text-primary text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-white rounded-full opacity-50" />
            </div>

            <div className="max-w-[1200px] mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                    Built for Organisations That Take <br/>
                    <span className="text-brand-primary">Workplace Wellbeing Seriously</span>
                  </h2>
                  <div className="space-y-6 text-lg text-slate-100 leading-relaxed">
                    <p>
                      SimplyDSE is trusted by organisations that see workplace wellbeing as a performance priority, not just a compliance requirement.
                    </p>
                    <p>
                      Our platform gives you visibility, control, and confidence in your DSE process without unnecessary complexity. It is built to scale with your organisation and adapt as your workplace evolves.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass-card !bg-white/5 border-white/10 p-10 md:p-12"
                >
                  <h3 className="text-2xl font-bold mb-6">Ready to improve?</h3>
                  <p className="text-slate-100 mb-10 leading-relaxed">
                    If you are ready to improve ergonomics, reduce risk, and create a more productive working environment, SimplyDSE gives you the structure to make it happen.
                  </p>
                  <Link href="/contact" className="btn-enterprise-primary !py-5 w-full flex items-center justify-center gap-3">
                    <span>Contact Our Team</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>

        </main>
      </ClientLayoutWrapper>
      <Footer />
    </div>
  );
}
