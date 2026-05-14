'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

import Reveal from './ui/Reveal';
import HeroVisuals from './HeroVisuals';

interface HeroProps {
  data?: {
    title?: string;
    description?: string;
    video_url?: string;
    primary_cta_text?: string;
    secondary_cta_text?: string;
  };
}

const Hero = ({ data }: HeroProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const title = data?.title || "Compliance management for modern organisations.";
  const description = data?.description || "Manage DSE assessments, automate compliance workflows, and monitor employee risk from one secure platform.";
  const videoUrl = data?.video_url || "/hero-video.mp4";
  const primaryCta = data?.primary_cta_text || "Get Started";
  const secondaryCta = data?.secondary_cta_text || "See Experience";

  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.readyState >= 3) {
        setIsVideoLoaded(true);
      }
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-white pt-20">
      {/* Cinematic Background Layer - Full Width & Visible */}
      <div className="absolute inset-0 z-0 bg-slate-50">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.png"
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover will-change-transform transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-50' : 'opacity-0'}`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        {/* Optimized overlay to ensure text legibility - reduced intensity */}
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/70" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center">
        {/* Bold Brand Anchor - Hollowed & Bold - Full Viewport Width */}
        <div className="w-screen max-w-full overflow-hidden select-none pointer-events-none mb-8 md:mb-20 px-4">
          <div className="flex justify-center items-center flex-nowrap whitespace-nowrap overflow-hidden">
            {"SIMPLYDSE".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  transition: {
                    duration: 1,
                    delay: 0.2 + (index * 0.05),
                    ease: [0.16, 1, 0.3, 1]
                  }
                }}
                className="text-[10.5vw] font-black text-transparent uppercase tracking-[-0.04em] leading-[0.8] inline-block will-change-transform"
                style={{ WebkitTextStroke: 'clamp(1px, 0.15vw, 3px) #0F172A' }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Content Grid: Aligning elements below the brand anchor */}
        <div className="section-container !py-0 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-4 text-left max-w-[1400px] w-full mx-auto">
          
          {/* Left Column: Context + CTAs + Trust */}
          <div className="space-y-8 max-w-xl">
            <Reveal delay={0.8} direction="left">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight leading-tight">
                  {title}
                </h2>
                <p className="text-xl text-text-secondary leading-relaxed opacity-80">
                  {description}
                </p>
              </div>
            </Reveal>

            <Reveal delay={1.0} direction="left">
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Link href="/contact" className="btn-enterprise-primary !py-5 !px-12 text-lg shadow-2xl shadow-brand-primary/20 flex items-center justify-center">
                  {primaryCta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="#features" className="flex items-center gap-4 text-text-primary font-bold hover:text-brand-primary transition-all group px-4 py-3">
                  <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center group-hover:border-brand-primary transition-colors bg-white/50 backdrop-blur-sm shadow-sm">
                    <Play className="w-4 h-4 fill-current ml-1" />
                  </div>
                  <span className="text-lg">{secondaryCta}</span>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Mini Dashboard Preview */}
          <div className="relative hidden lg:block h-full">
            <Reveal delay={1.0} direction="right">
              <div className="relative z-10 scale-[0.75] xl:scale-[0.9] 2xl:scale-100 origin-right transition-transform duration-700">
                <HeroVisuals />
              </div>
              
              {/* Soft glow behind the mini dashboard */}
              <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] rounded-full -z-10" />
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
