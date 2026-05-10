import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
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
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${isVideoLoaded ? 'opacity-40' : 'opacity-0'}`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure text legibility while keeping video visible */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white" />
      </div>

      <div className="relative z-10 section-container w-full flex flex-col items-center justify-center text-center">
        {/* Bold Brand Anchor - Hollowed & Bold */}
        <div className="relative w-full px-4 text-center select-none pointer-events-none mb-4">
          <div className="flex justify-center items-center flex-nowrap whitespace-nowrap">
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
                className="text-[13vw] md:text-[14vw] font-black text-transparent uppercase tracking-tighter leading-[0.8] inline-block will-change-transform"
                style={{ WebkitTextStroke: '2px #0F172A' }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Content Grid: Aligning elements below the brand anchor */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-8 text-left">
          
          {/* Left Column: Context + CTAs + Trust */}
          <div className="space-y-6 max-w-xl">
            <Reveal delay={0.8} direction="left">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                  {title}
                </h2>
                <p className="text-lg text-text-secondary leading-relaxed opacity-80">
                  {description}
                </p>
              </div>
            </Reveal>

            <Reveal delay={1.0} direction="left">
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <button className="btn-enterprise-primary !py-4 !px-10 text-lg shadow-xl shadow-brand-primary/20">
                  {primaryCta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="flex items-center gap-3 text-text-primary font-bold hover:text-brand-primary transition-all group px-4 py-3">
                  <div className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center group-hover:border-brand-primary transition-colors bg-white/50 backdrop-blur-sm">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span className="text-base">{secondaryCta}</span>
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Mini Dashboard Preview */}
          <div className="relative hidden lg:block">
            <Reveal delay={1.0} direction="right">
              <div className="relative z-10 scale-[0.7] xl:scale-[0.8] origin-right translate-x-12">
                <HeroVisuals />
              </div>
              
              {/* Soft glow behind the mini dashboard */}
              <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
