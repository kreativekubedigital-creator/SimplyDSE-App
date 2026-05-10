import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Globe2 } from 'lucide-react';
import Reveal from './ui/Reveal';
import HeroVisuals from './HeroVisuals';

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.readyState >= 3) {
        setIsVideoLoaded(true);
      }
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative min-h-[110vh] flex flex-col justify-center items-center pt-32 pb-[var(--spacing-section)] overflow-hidden bg-white">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${isVideoLoaded ? 'opacity-[0.08]' : 'opacity-0'}`}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
      </div>

      {/* Realistic Product UI Floating Layer - Very Subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
        <HeroVisuals />
      </div>

      <div className="relative z-10 section-container text-center space-y-12">
        {/* Refined Heading Hierarchy */}
        <div className="space-y-8">
          <Reveal delay={0.1} direction="down">
            <div className="badge-enterprise">
              <Globe2 className="w-3.5 h-3.5" />
              Trusted by 400+ Enterprise Teams
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tight text-text-primary text-balance leading-[0.9] py-2">
              Compliance <br /> 
              <span className="text-slate-300">at scale.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed text-balance font-medium">
              The intelligent operating system for global organizations to automate risk 
              assessments and maintain clinical-grade safety.
            </p>
          </Reveal>
        </div>

        {/* Sophisticated CTAs */}
        <Reveal delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="btn-enterprise-primary">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-3 text-text-primary font-bold hover:text-brand-primary transition-all group px-8 py-4">
              <Play className="w-4 h-4 fill-current" />
              See the Experience
            </button>
          </div>
        </Reveal>

        {/* Trusted By - Minimalist Stripe Style */}
        <Reveal delay={0.6}>
          <div className="pt-32 opacity-20">
            <p className="label-secondary mb-12">Powering Safety for Leaders Like</p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 grayscale">
              {['Microsoft', 'Senedd', 'Virtusa', 'Alstom'].map(brand => (
                <span key={brand} className="text-lg font-black tracking-tighter text-text-primary">{brand}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;


