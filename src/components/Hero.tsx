import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal from './ui/Reveal';

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to play the video on mount to handle browser autoplay policies
    if (videoRef.current) {
      // Safety check: if video is already ready, set loaded state
      if (videoRef.current.readyState >= 3) {
        setIsVideoLoaded(true);
      }
      
      videoRef.current.play().catch(error => {
        console.warn("Video autoplay blocked or failed:", error);
      });
    }
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] flex flex-col bg-white" aria-labelledby="hero-heading">
      
      {/* Plain Background */}
      <div className="absolute inset-0 bg-slate-50 z-0" />

      {/* Simple Video Background (Moved down slightly to avoid navbar collision) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        onCanPlayThrough={() => setIsVideoLoaded(true)}
        className={`absolute top-8 inset-x-0 w-full h-[calc(100%-2rem)] object-cover z-0 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-50' : 'opacity-0'}`}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Reduced Overlay for better video clarity */}
      <div className="absolute top-8 inset-x-0 h-[calc(100%-2rem)] bg-white/15 backdrop-blur-[1px] z-10" />

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-20 px-6">
        {/* Bold Brand Anchor - Hollow, Full Width & Animated (Optimized) */}
        <div className="relative w-full px-4 text-center overflow-hidden mb-8">
          <div className="flex justify-center items-center select-none pointer-events-none">
            {"SimplyDSE".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  transition: {
                    duration: 1.2,
                    delay: 0.2 + (index * 0.05),
                    ease: [0.23, 1, 0.32, 1] as any
                  }
                }}
                className="text-[16vw] font-black text-transparent uppercase tracking-tighter leading-[0.8] inline-block will-change-transform"
                style={{ WebkitTextStroke: '1.5px #0F172A' }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          
          {/* Simplified ambient animation (no scale/blur for performance) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-brand-primary/10 -z-10 rounded-full mix-blend-multiply opacity-10"
          />
        </div>

        {/* CTAs - Below the branding */}
        <Reveal delay={0.2} direction="up">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-secondary transition-all flex items-center gap-2 group shadow-lg shadow-brand-primary/20"
            >
              Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/80 backdrop-blur-md text-text-primary border border-border-subtle rounded-full font-semibold hover:bg-white transition-all flex items-center gap-2 shadow-sm"
            >
              Book a Demo <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </Reveal>
      </div>

      {/* Tagline - Just above the cards */}
      <div className="relative z-20 w-full flex justify-center px-6 mb-16">
        <Reveal delay={0.4} direction="up">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-primary mb-3">
            DSE Compliance, Without Complexity.
          </h2>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
              The intelligent operating system for organizations to manage assessments, monitor risks, and maintain global compliance.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Metrics Cards - Overlapping 50% out of the hero section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full z-40 flex flex-col items-center">
        <Reveal delay={0.6} direction="up" className="w-full max-w-4xl relative">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[80px] rounded-full opacity-30 -z-10 translate-y-[-20%]" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 px-4">
            {/* Compliance Card */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all group"
            >
              <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mb-1 md:mb-2">Global Compliance</p>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-0.5 md:mb-1 group-hover:text-brand-primary transition-colors">99.8%</h3>
              <p className="text-[10px] md:text-xs text-brand-primary font-medium">Verified uptime</p>
            </motion.div>

            {/* Risk Card */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all group"
            >
              <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mb-1 md:mb-2">Active Risk Monitoring</p>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-0.5 md:mb-1 group-hover:text-brand-primary transition-colors">Real-time</h3>
              <p className="text-[10px] md:text-xs text-brand-primary font-medium">Automated alerts</p>
            </motion.div>

            {/* Enterprise Card */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 md:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all group"
            >
              <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-widest mb-1 md:mb-2">Enterprise Ready</p>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-0.5 md:mb-1 group-hover:text-brand-primary transition-colors">SOC2</h3>
              <p className="text-[10px] md:text-xs text-brand-primary font-medium">Certified security</p>
            </motion.div>
          </div>
        </Reveal>
      </div>

      {/* Background UI Grid decoration */}
      <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
      />
    </section>
  );
};

export default Hero;

