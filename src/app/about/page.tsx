'use client';

import { motion } from 'framer-motion';
import { Shield, Target, Users, Zap, Award, CheckCircle2, Heart, Rocket } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="w-6 h-6 text-brand-primary" />,
      title: "Integrity First",
      description: "We build trust through transparency and unwavering ethical standards in everything we do."
    },
    {
      icon: <Target className="w-6 h-6 text-brand-primary" />,
      title: "Precision Driven",
      description: "Our solutions are engineered for absolute accuracy in compliance and risk management."
    },
    {
      icon: <Users className="w-6 h-6 text-brand-primary" />,
      title: "Human Centric",
      description: "Technology serves people. We focus on enhancing the workplace experience for every employee."
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-primary" />,
      title: "Innovation Always",
      description: "We're constantly pushing the boundaries of what's possible in health and safety tech."
    }
  ];

  const stats = [
    { label: "Active Users", value: "250k+" },
    { label: "Compliance Rate", value: "99.9%" },
    { label: "Enterprise Clients", value: "500+" },
    { label: "Safety Audits", value: "1M+" }
  ];

  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <ClientLayoutWrapper>
        <main className="relative pt-32">
          {/* Hero Section */}
          <section className="relative px-6 pb-24 overflow-hidden">
            <div className="max-w-[1200px] mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-brand-primary">Our Story</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 text-text-primary leading-[1.05]">
                  Revolutionizing <span className="text-brand-primary italic">workplace</span> safety.
                </h1>
                
                <p className="text-xl text-text-secondary leading-relaxed mb-12 max-w-3xl mx-auto">
                  SimplyDSE was founded on a simple premise: enterprise compliance shouldn't be a burden. We're on a mission to automate safety and empower teams through intelligent, human-centered technology.
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1000px] mx-auto mt-20"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="text-center p-8 rounded-3xl bg-slate-50 border border-border-subtle hover:border-brand-primary/30 transition-all group">
                    <div className="text-4xl font-bold text-brand-primary mb-2 group-hover:scale-110 transition-transform duration-300 tracking-tighter">
                      {stat.value}
                    </div>
                    <div className="text-[13px] font-bold text-text-secondary uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square -z-10">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px]" />
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="py-32 px-6 bg-slate-50 border-y border-border-subtle">
            <div className="max-w-[1200px] mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-text-primary leading-tight">
                    Built for the modern, <br/>distributed enterprise.
                  </h2>
                  <p className="text-lg text-text-secondary leading-relaxed mb-10">
                    As work evolved, compliance systems stayed stagnant. We saw the gap and built a platform that handles the complexity of hybrid work, global regulations, and evolving health standards with elegance.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary mb-1">Global Scale</h4>
                        <p className="text-sm text-text-secondary">Deploy assessments to thousands of employees across time zones in minutes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary mb-1">Data-First Approach</h4>
                        <p className="text-sm text-text-secondary">Turn compliance checklists into actionable health and productivity insights.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-brand-primary/20 blur-[60px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative glass-card overflow-hidden aspect-[4/3]">
                    <img 
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069" 
                      alt="Modern Office" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-32 px-6">
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold tracking-tight mb-6">Our Core Values</h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  The principles that guide our product development, company culture, and client relationships.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-10 rounded-[32px] bg-white border border-border-subtle hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-8">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 tracking-tight">{value.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Join Us CTA */}
          <section className="py-32 px-6 bg-brand-primary relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-full h-full opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-white rounded-full animate-[ping_4s_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-white rounded-full" />
            </div>
            
            <div className="max-w-[800px] mx-auto relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                Ready to transform your workplace culture?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="px-10 py-5 bg-white text-brand-primary font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/10">
                  See Open Positions
                </button>
                <button className="px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </section>
        </main>
      </ClientLayoutWrapper>
      <Footer />
    </div>
  );
}
