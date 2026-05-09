import Reveal from './ui/Reveal';
import Section from './ui/Section';
import Heading from './ui/Heading';
import { motion } from 'framer-motion';

const Solutions = () => {
  return (
    <Section id="solutions" className="bg-slate-50">
      <div className="space-y-32">
        {/* Solution 1: Global Collaboration */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <div className="flex-1 space-y-8">
            <Reveal delay={0.1} direction="left">
              <span className="text-brand-primary font-bold tracking-widest uppercase text-sm">Empowering Teams</span>
            </Reveal>
            <Reveal delay={0.2} direction="left">
              <Heading level={2} className="text-text-primary leading-tight">
                Built for the modern, <span className="text-brand-primary">distributed workforce.</span>
              </Heading>
            </Reveal>
            <Reveal delay={0.3} direction="left">
              <p className="text-text-secondary text-lg leading-relaxed">
                Whether your team is in a central HQ or spread across continents, SimplyDSE provides a unified platform for risk management. Our collaboration tools allow global teams to stay synchronized on compliance standards and action plans.
              </p>
            </Reveal>
            <Reveal delay={0.4} direction="left">
              <ul className="space-y-4">
                {['Multi-language support', 'Global risk heatmaps', 'Cross-border reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          
          <div className="flex-1 w-full">
            <Reveal delay={0.3} direction="right">
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-primary/5 rounded-[40px] blur-2xl group-hover:bg-brand-primary/10 transition-colors duration-700" />
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] as any }}
                  className="relative rounded-[32px] overflow-hidden border border-white shadow-2xl aspect-[4/3]"
                >
                  <img 
                    src="/collaboration.png" 
                    alt="Global team collaborating on compliance" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Solution 2: Human-Centric Support */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24">
          <div className="flex-1 space-y-8">
            <Reveal delay={0.1} direction="right">
              <span className="text-brand-primary font-bold tracking-widest uppercase text-sm">Human-Centric Tech</span>
            </Reveal>
            <Reveal delay={0.2} direction="right">
              <Heading level={2} className="text-text-primary leading-tight">
                Expert support at <span className="text-brand-primary">every step.</span>
              </Heading>
            </Reveal>
            <Reveal delay={0.3} direction="right">
              <p className="text-text-secondary text-lg leading-relaxed">
                Technology is only half the story. Our dedicated success managers and DSE experts are available to help you navigate complex regulatory landscapes, ensuring your organization remains not just compliant, but excellent.
              </p>
            </Reveal>
            <div className="pt-4">
              <Reveal delay={0.4} direction="right">
                <button className="px-8 py-4 bg-text-primary text-white rounded-full font-semibold hover:bg-brand-primary transition-all shadow-lg">
                  Meet the Experts
                </button>
              </Reveal>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <Reveal delay={0.3} direction="left">
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-primary/5 rounded-[40px] blur-2xl group-hover:bg-brand-primary/10 transition-colors duration-700" />
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] as any }}
                  className="relative rounded-[32px] overflow-hidden border border-white shadow-2xl aspect-[4/3]"
                >
                  <img 
                    src="/support.png" 
                    alt="Friendly support professional" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Solutions;
