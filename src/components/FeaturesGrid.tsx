'use client';

import Reveal from './ui/Reveal';
import Image from 'next/image';
import { ClipboardCheck, Bell, BarChart3, Shield } from 'lucide-react';

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  image, 
  className = "", 
  variant = "default" 
}: { 
  title: string, 
  description: string, 
  icon: any, 
  image?: string, 
  className?: string,
  variant?: "hero" | "default"
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-[#0A0A0A] transition-all duration-700 hover:border-slate-600 ${className}`}>
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`relative z-10 p-10 flex flex-col h-full ${variant === 'hero' ? 'md:flex-row gap-12' : ''}`}>
        <div className={variant === 'hero' ? 'flex-1 space-y-6' : 'space-y-6'}>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`${variant === 'hero' ? 'text-3xl md:text-5xl' : 'text-2xl'} font-bold text-white tracking-tight leading-tight mb-4`}>
              {title}
            </h3>
            <p className="text-white/90 text-lg leading-relaxed max-w-sm">
              {description}
            </p>
          </div>
        </div>

        {image && (
          <div className={`${variant === 'hero' ? 'flex-1 mt-0' : 'mt-auto pt-12'} relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800/50 bg-slate-900/50`}>
            <Image 
              src={image} 
              alt={title} 
              fill
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
              sizes={variant === 'hero' ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturesGrid = () => {
  return (
    <section id="features" className="bg-black overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="mb-24 max-w-4xl">
          <Reveal delay={0.1}>
            <span className="badge-enterprise">Platform Architecture</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-6xl md:text-8xl font-bold text-white mt-8 tracking-tighter leading-[0.9] text-balance">
              Simplifying <span className="text-slate-300">DSE Assessment</span> at Scale.
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-xl md:text-2xl text-white/90 mt-12 leading-relaxed max-w-2xl font-medium">
              SimplyDSE replaces fragmented safety processes with a unified operational intelligence layer designed for modern organisations.
            </p>
          </Reveal>
        </div>

        {/* New Layout Inspired by Reference */}
        <div className="space-y-8">
          {/* Hero Feature: Smart Assessment System */}
          <Reveal delay={0.4} direction="up" width="100%">
            <FeatureCard 
              variant="hero"
              icon={ClipboardCheck}
              title="Smart Assessment System"
              description="Structured questionnaires with automated scoring and clear risk classification, helping organisations quickly identify and address potential ergonomic issues."
              image="/features-1.png"
              className="min-h-[500px]"
            />
          </Reveal>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0.5} direction="up" hFull>
              <FeatureCard 
                icon={Bell}
                title="Automated Notifications"
                description="Send assessment invitations, reminders, and follow-ups automatically, reducing manual effort and ensuring higher completion rates."
                image="/notifications-visual.png"
                className="h-full"
              />
            </Reveal>

            <Reveal delay={0.6} direction="up" hFull>
              <FeatureCard 
                icon={BarChart3}
                title="Dashboard & Reporting"
                description="Monitor assessment progress, track completion rates, and view risk insights in real time with easy-to-export reports."
                image="/dashboard-visual.png"
                className="h-full"
              />
            </Reveal>

            <Reveal delay={0.7} direction="up" hFull>
              <FeatureCard 
                icon={Shield}
                title="Secure User Access"
                description="Role-based access control ensures HR teams and staff only access relevant data, maintaining privacy and security."
                image="/features-3.png"
                className="h-full"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
