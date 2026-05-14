'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Shield, Globe, Clock } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <ClientLayoutWrapper>
        <main className="relative pt-32 pb-20">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] pointer-events-none opacity-30">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-[1200px] mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Left Column: Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-brand-primary">Contact Us</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-text-primary leading-[1.1]">
                  Let's secure your <span className="text-brand-primary italic">workplace</span> together.
                </h1>
                
                <p className="text-xl text-text-secondary leading-relaxed mb-12 max-w-lg">
                  Have questions about our enterprise compliance solutions? Our team of specialists is ready to help you optimize your DSE management.
                </p>

                <div className="grid sm:grid-cols-2 gap-8 mb-12">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-border-subtle hover:border-brand-primary/30 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h3 className="font-bold mb-1">Email Support</h3>
                    <p className="text-sm text-text-secondary">support@simplydse.com</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-border-subtle hover:border-brand-primary/30 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h3 className="font-bold mb-1">Sales Inquiry</h3>
                    <p className="text-sm text-text-secondary">+44 (0) 20 1234 5678</p>
                  </div>
                </div>

                {/* Badges/Trust */}
                <div className="flex flex-wrap gap-6 pt-8 border-t border-border-subtle">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-medium text-text-secondary">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-medium text-text-secondary">Global Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-medium text-text-secondary">24h Response</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-brand-primary/5 blur-[40px] rounded-[40px] -z-10" />
                <div className="glass-card p-10 md:p-12">
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-text-primary ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          className="w-full px-5 py-4 rounded-xl bg-white border border-border-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-text-primary ml-1">Work Email</label>
                        <input 
                          type="email" 
                          placeholder="john@company.com"
                          className="w-full px-5 py-4 rounded-xl bg-white border border-border-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-text-primary ml-1">Company</label>
                      <input 
                        type="text" 
                        placeholder="Enterprise Solutions Ltd"
                        className="w-full px-5 py-4 rounded-xl bg-white border border-border-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-text-primary ml-1">Subject</label>
                      <select className="w-full px-5 py-4 rounded-xl bg-white border border-border-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm appearance-none">
                        <option>Product Demo Request</option>
                        <option>Technical Support</option>
                        <option>Partnership Inquiry</option>
                        <option>General Question</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-text-primary ml-1">Message</label>
                      <textarea 
                        rows={4}
                        placeholder="How can we help you?"
                        className="w-full px-5 py-4 rounded-xl bg-white border border-border-strong focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm resize-none"
                      />
                    </div>

                    <button className="w-full btn-enterprise-primary !py-5 flex items-center justify-center gap-3 group">
                      <span>Send Message</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>

                    <p className="text-[12px] text-text-secondary text-center">
                      By submitting this form, you agree to our <a href="#" className="underline">Privacy Policy</a>.
                    </p>
                  </form>
                </div>
              </motion.div>

            </div>
          </div>
        </main>
      </ClientLayoutWrapper>
      <Footer />
    </div>
  );
}
