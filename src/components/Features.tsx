import { Shield, Zap, Globe, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Section from './ui/Section';
import Heading from './ui/Heading';
import Badge from './ui/Badge';
import Reveal from './ui/Reveal';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  size: string;
}

const features: Feature[] = [
  {
    title: "Automated Compliance",
    description: "Self-service workflows that handle thousands of assessments with zero manual intervention.",
    icon: Shield,
    color: "bg-blue-50 text-brand-primary",
    size: "col-span-1"
  },
  {
    title: "Operational Data",
    description: "Real-time risk monitoring across your entire global workforce.",
    icon: BarChart3,
    color: "bg-slate-50 text-text-secondary",
    size: "col-span-1"
  },
  {
    title: "Global Reach",
    description: "Built for distributed teams in over 40 countries.",
    icon: Globe,
    color: "bg-slate-50 text-text-secondary",
    size: "col-span-1"
  },
  {
    title: "HR Stack Sync",
    description: "Deep integrations with Workday, BambooHR, and Microsoft Teams.",
    icon: Zap,
    color: "bg-blue-50 text-brand-primary",
    size: "col-span-1"
  }
];

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon;
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] as any }}
      className="card-premium h-full p-8 md:p-10 group transition-all duration-500 flex flex-col items-start cursor-default"
    >
      <div className={`w-14 h-14 rounded-2xl ${feature.color} flex-shrink-0 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-4 tracking-tight">{feature.title}</h3>
      <p className="text-text-secondary leading-relaxed text-base flex-grow">{feature.description}</p>
    </motion.div>
  );
};

const Features = () => {
  return (
    <Section id="features" className="bg-white">
      <div className="mb-20 max-w-3xl">
        <Reveal delay={0.1}>
          <Badge variant="blue">Capabilities</Badge>
        </Reveal>
        <Reveal delay={0.2}>
          <Heading level={2} className="text-text-primary mt-6" light>
            Engineered for <span className="font-bold text-brand-primary">operational excellence.</span>
          </Heading>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-text-secondary text-lg mt-6 leading-relaxed">
            Every feature is designed to reduce cognitive load while maximizing compliance coverage across your entire organization.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* First Row: Automated Compliance, Operational Data, and Image */}
        <Reveal delay={0.1} className="col-span-1" direction="up" width="100%" hFull>
          <FeatureCard feature={features[0]} />
        </Reveal>

        <Reveal delay={0.2} className="col-span-1" direction="up" width="100%" hFull>
          <FeatureCard feature={features[1]} />
        </Reveal>

        <Reveal delay={0.3} className="col-span-1" direction="up" width="100%">
          <div className="relative group h-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-brand-primary/0 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-100 shadow-xl bg-slate-50">
              <img 
                src="/operational_excellence.png" 
                alt="Operational Excellence Visualization" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </Reveal>

        {/* Second Row: Global Reach and HR Stack Sync */}
        <Reveal delay={0.4} className="col-span-1" direction="up" width="100%" hFull>
          <FeatureCard feature={features[2]} />
        </Reveal>

        <Reveal delay={0.5} className="col-span-1" direction="up" width="100%" hFull>
          <FeatureCard feature={features[3]} />
        </Reveal>
      </div>
    </Section>
  );
};

export default Features;
