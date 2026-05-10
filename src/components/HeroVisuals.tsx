import { motion } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

const FloatingCard = ({ children, className, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay, ease: [0.23, 1, 0.32, 1] }}
    className={`absolute glass-premium p-6 rounded-3xl pointer-events-none hidden lg:block ${className}`}
  >
    {children}
  </motion.div>
);

const HeroVisuals = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 1. Compliance Coverage - Very Subtle */}
      <FloatingCard className="top-[22%] left-[10%] w-56" delay={0.6}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
          </div>
          <span className="label-secondary">Platform Status</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-text-primary tracking-tighter">99.9%</span>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "99.9%" }}
              transition={{ duration: 1.5, delay: 1 }}
              className="h-full bg-brand-primary/20" 
            />
          </div>
        </div>
      </FloatingCard>

      {/* 2. Operational Activity - Very Subtle */}
      <FloatingCard className="top-[60%] right-[12%] w-64" delay={0.8}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="label-secondary">Global Monitoring</span>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-6 h-6 rounded-lg bg-slate-100" />
              <div className="flex-1 h-1.5 bg-slate-50 rounded-full" />
            </div>
          ))}
        </div>
      </FloatingCard>
    </div>
  );
};

export default HeroVisuals;
